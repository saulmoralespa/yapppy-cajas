import { describe, test, expect, beforeEach } from 'vitest';
import { DeviceSessionEntity } from '../../../../../src/domain/entities/session/session.entity';

describe('DeviceSessionEntity', () => {
  describe('Factory Methods', () => {
    describe('createNew', () => {
      test('should create new session with token', () => {
        const session = DeviceSessionEntity.createNew('token-abc123');
        
        expect(session).toBeDefined();
        expect(session.token).toBe('token-abc123');
      });

      test('should generate unique sessionId (UUID)', () => {
        const session1 = DeviceSessionEntity.createNew('token-1');
        const session2 = DeviceSessionEntity.createNew('token-2');
        
        expect(session1.sessionId).toBeDefined();
        expect(session2.sessionId).toBeDefined();
        expect(session1.sessionId).not.toBe(session2.sessionId);
      });

      test('should set current timestamp for createdAt', () => {
        const now = Date.now();
        const session = DeviceSessionEntity.createNew('token-abc');
        
        expect(session.createdAt).toBeGreaterThanOrEqual(now);
        expect(session.createdAt).toBeLessThanOrEqual(Date.now());
      });

      test('should have default 6-hour expiration (21600 seconds)', () => {
        const session = DeviceSessionEntity.createNew('token-abc');
        
        expect(session.expiresIn).toBe(21600);
      });

      test('should reject empty token', () => {
        expect(() => DeviceSessionEntity.createNew('')).toThrow('Token is required');
      });

      test('should reject undefined token', () => {
        expect(() => DeviceSessionEntity.createNew(undefined as any)).toThrow('Token is required');
      });

      test('should reject null token', () => {
        expect(() => DeviceSessionEntity.createNew(null as any)).toThrow('Token is required');
      });

      test('should accept token with special characters', () => {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0';
        const session = DeviceSessionEntity.createNew(token);
        
        expect(session.token).toBe(token);
      });
    });

    describe('fromStorage', () => {
      test('should reconstruct session from storage', () => {
        const sessionId = 'session-123';
        const token = 'token-xyz';
        const createdAt = Date.now() - 1000;
        const expiresIn = 21600;
        
        const session = DeviceSessionEntity.fromStorage(
          sessionId,
          token,
          createdAt,
          expiresIn
        );
        
        expect(session.sessionId).toBe(sessionId);
        expect(session.token).toBe(token);
        expect(session.createdAt).toBe(createdAt);
        expect(session.expiresIn).toBe(expiresIn);
      });

      test('should reject missing sessionId', () => {
        expect(() => 
          DeviceSessionEntity.fromStorage('', 'token-abc', Date.now(), 21600)
        ).toThrow('Session ID is required');
      });

      test('should reject missing token', () => {
        expect(() => 
          DeviceSessionEntity.fromStorage('session-123', '', Date.now(), 21600)
        ).toThrow('Token is required');
      });

      test('should handle session from 1 hour ago', () => {
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        const session = DeviceSessionEntity.fromStorage(
          'session-123',
          'token-abc',
          oneHourAgo,
          21600
        );
        
        expect(session.createdAt).toBe(oneHourAgo);
        expect(session.isExpired()).toBe(false);
      });

      test('should handle session from 7 hours ago', () => {
        const sevenHoursAgo = Date.now() - (7 * 60 * 60 * 1000);
        const session = DeviceSessionEntity.fromStorage(
          'session-123',
          'token-abc',
          sevenHoursAgo,
          21600 // 6 horas
        );
        
        expect(session.isExpired()).toBe(true);
      });
    });
  });

  describe('Expiration Logic (CRÍTICO)', () => {
    test('should detect expired sessions', () => {
      const pastTime = Date.now() - (7 * 60 * 60 * 1000); // 7 horas atrás
      const session = DeviceSessionEntity.fromStorage(
        'id-1',
        'token-123',
        pastTime,
        21600 // 6 horas de expiración
      );
      
      expect(session.isExpired()).toBe(true);
    });

    test('should detect active sessions', () => {
      const recentTime = Date.now() - (1 * 60 * 60 * 1000); // 1 hora atrás
      const session = DeviceSessionEntity.fromStorage(
        'id-1',
        'token-123',
        recentTime,
        21600 // 6 horas
      );
      
      expect(session.isExpired()).toBe(false);
    });

    test('should detect session at exact expiration time', () => {
      const exactlyExpired = Date.now() - (21600 * 1000); // Exactamente 6 horas
      const session = DeviceSessionEntity.fromStorage(
        'id-1',
        'token-123',
        exactlyExpired,
        21600
      );
      
      expect(session.isExpired()).toBe(true);
    });

    test('should detect session 1 second before expiration', () => {
      const almostExpired = Date.now() - ((21600 - 1) * 1000); // 1 segundo antes
      const session = DeviceSessionEntity.fromStorage(
        'id-1',
        'token-123',
        almostExpired,
        21600
      );
      
      expect(session.isExpired()).toBe(false);
    });

    test('new session should not be expired', () => {
      const session = DeviceSessionEntity.createNew('token-abc');
      
      expect(session.isExpired()).toBe(false);
    });

    test('should handle custom expiration time (1 hour)', () => {
      const oneHourAgo = Date.now() - (61 * 60 * 1000); // 61 minutos atrás
      const session = DeviceSessionEntity.fromStorage(
        'id-1',
        'token-123',
        oneHourAgo,
        3600 // 1 hora = 3600 segundos
      );
      
      expect(session.isExpired()).toBe(true);
    });

    test('should handle custom expiration time (12 hours)', () => {
      const fiveHoursAgo = Date.now() - (5 * 60 * 60 * 1000); // 5 horas atrás
      const session = DeviceSessionEntity.fromStorage(
        'id-1',
        'token-123',
        fiveHoursAgo,
        43200 // 12 horas = 43200 segundos
      );
      
      expect(session.isExpired()).toBe(false);
    });

    test('should handle sessions created just now', () => {
      const now = Date.now();
      const session = DeviceSessionEntity.fromStorage(
        'id-1',
        'token-123',
        now,
        21600
      );
      
      expect(session.isExpired()).toBe(false);
    });

    test('should handle very old sessions', () => {
      const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
      const session = DeviceSessionEntity.fromStorage(
        'id-1',
        'token-123',
        threeDaysAgo,
        21600
      );
      
      expect(session.isExpired()).toBe(true);
    });
  });

  describe('Expiration Timestamp Calculation', () => {
    test('getExpirationTimestamp should return correct value', () => {
      const createdAt = 1733673600000; // Timestamp fijo
      const expiresIn = 3600; // 1 hora
      const session = DeviceSessionEntity.fromStorage(
        'id-1',
        'token-123',
        createdAt,
        expiresIn
      );
      
      const expected = createdAt + (expiresIn * 1000);
      expect(session.getExpirationTimestamp()).toBe(expected);
    });

    test('getExpirationTimestamp for 6-hour expiration', () => {
      const createdAt = 1700000000000;
      const expiresIn = 21600; // 6 horas
      const session = DeviceSessionEntity.fromStorage(
        'id-1',
        'token-123',
        createdAt,
        expiresIn
      );
      
      const expected = createdAt + (21600 * 1000);
      expect(session.getExpirationTimestamp()).toBe(expected);
      expect(session.getExpirationTimestamp()).toBe(1700000000000 + 21600000);
    });

    test('expiration timestamp should be in the future for new sessions', () => {
      const session = DeviceSessionEntity.createNew('token-abc');
      const expirationTime = session.getExpirationTimestamp();
      
      expect(expirationTime).toBeGreaterThan(Date.now());
    });

    test('expiration timestamp should be in the past for expired sessions', () => {
      const oldTime = Date.now() - (7 * 60 * 60 * 1000); // 7 horas atrás
      const session = DeviceSessionEntity.fromStorage(
        'id-1',
        'token-123',
        oldTime,
        21600
      );
      
      const expirationTime = session.getExpirationTimestamp();
      expect(expirationTime).toBeLessThan(Date.now());
    });
  });

  describe('Serialization', () => {
    describe('toStorage', () => {
      test('should return correct storage structure', () => {
        const session = DeviceSessionEntity.createNew('token-abc');
        const storage = session.toStorage();
        
        expect(storage).toHaveProperty('sessionId');
        expect(storage).toHaveProperty('token', 'token-abc');
        expect(storage).toHaveProperty('createdAt');
        expect(storage).toHaveProperty('expiresIn', 21600);
      });

      test('createdAt should be a number (timestamp)', () => {
        const session = DeviceSessionEntity.createNew('token-abc');
        const storage = session.toStorage();
        
        expect(typeof storage.createdAt).toBe('number');
        expect(storage.createdAt).toBeGreaterThan(0);
      });

      test('should preserve all fields for reconstructed session', () => {
        const originalSession = DeviceSessionEntity.createNew('token-xyz');
        const storage = originalSession.toStorage();
        
        const reconstructed = DeviceSessionEntity.fromStorage(
          storage.sessionId,
          storage.token,
          storage.createdAt,
          storage.expiresIn
        );
        
        expect(reconstructed.sessionId).toBe(originalSession.sessionId);
        expect(reconstructed.token).toBe(originalSession.token);
        expect(reconstructed.createdAt).toBe(originalSession.createdAt);
        expect(reconstructed.expiresIn).toBe(originalSession.expiresIn);
      });
    });

    describe('toJSON', () => {
      test('should include all required fields', () => {
        const session = DeviceSessionEntity.createNew('token-abc');
        const json = session.toJSON();
        
        expect(json).toHaveProperty('sessionId');
        expect(json).toHaveProperty('token');
        expect(json).toHaveProperty('createdAt');
        expect(json).toHaveProperty('expiresIn');
        expect(json).toHaveProperty('expiresAt');
        expect(json).toHaveProperty('isExpired');
      });

      test('expiresAt should be valid ISO string', () => {
        const session = DeviceSessionEntity.createNew('token-abc');
        const json = session.toJSON();
        
        expect(typeof json.expiresAt).toBe('string');
        
        const expiresAtDate = new Date(json.expiresAt);
        expect(expiresAtDate).toBeInstanceOf(Date);
        expect(expiresAtDate.getTime()).not.toBeNaN();
      });

      test('isExpired should be false for new sessions', () => {
        const session = DeviceSessionEntity.createNew('token-abc');
        const json = session.toJSON();
        
        expect(json.isExpired).toBe(false);
      });

      test('isExpired should be true for expired sessions', () => {
        const oldTime = Date.now() - (7 * 60 * 60 * 1000);
        const session = DeviceSessionEntity.fromStorage(
          'id-1',
          'token-123',
          oldTime,
          21600
        );
        const json = session.toJSON();
        
        expect(json.isExpired).toBe(true);
      });

      test('expiresAt should be parseable back to Date', () => {
        const session = DeviceSessionEntity.createNew('token-abc');
        const json = session.toJSON();
        
        const parsedDate = new Date(json.expiresAt);
        expect(parsedDate.getTime()).toBe(session.getExpirationTimestamp());
      });
    });
  });

  describe('Casos de uso reales', () => {
    test('should create session for Yappy token', () => {
      const yappyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example';
      const session = DeviceSessionEntity.createNew(yappyToken);
      
      expect(session.token).toBe(yappyToken);
      expect(session.isExpired()).toBe(false);
      expect(session.expiresIn).toBe(21600);
    });

    test('should load session from JSON file', () => {
      // Simula datos de sessions.json
      const storedData = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        token: 'stored-token-123',
        createdAt: Date.now() - (2 * 60 * 60 * 1000), // 2 horas atrás
        expiresIn: 21600
      };
      
      const session = DeviceSessionEntity.fromStorage(
        storedData.sessionId,
        storedData.token,
        storedData.createdAt,
        storedData.expiresIn
      );
      
      expect(session.isExpired()).toBe(false);
      expect(session.sessionId).toBe(storedData.sessionId);
    });

    test('should filter out expired sessions', () => {
      const sessions = [
        DeviceSessionEntity.fromStorage('id-1', 'token-1', Date.now() - (7 * 60 * 60 * 1000), 21600), // Expirada
        DeviceSessionEntity.fromStorage('id-2', 'token-2', Date.now() - (1 * 60 * 60 * 1000), 21600), // Activa
        DeviceSessionEntity.fromStorage('id-3', 'token-3', Date.now() - (10 * 60 * 60 * 1000), 21600), // Expirada
      ];
      
      const activeSessions = sessions.filter(s => !s.isExpired());
      
      expect(activeSessions).toHaveLength(1);
      expect(activeSessions[0].sessionId).toBe('id-2');
    });

    test('should get most recent valid session', () => {
      const now = Date.now();
      const sessions = [
        DeviceSessionEntity.fromStorage('id-1', 'token-1', now - (5 * 60 * 60 * 1000), 21600),
        DeviceSessionEntity.fromStorage('id-2', 'token-2', now - (3 * 60 * 60 * 1000), 21600),
        DeviceSessionEntity.fromStorage('id-3', 'token-3', now - (1 * 60 * 60 * 1000), 21600),
      ];
      
      const validSessions = sessions.filter(s => !s.isExpired());
      const mostRecent = validSessions[validSessions.length - 1];
      
      expect(mostRecent.sessionId).toBe('id-3');
      expect(mostRecent.token).toBe('token-3');
    });
  });

  describe('Edge Cases', () => {
    test('should handle session created at timestamp 0', () => {
      // Timestamp 0 es tratado como falsy por el constructor
      // Por lo tanto, se usará Date.now() en su lugar
      const session = DeviceSessionEntity.fromStorage(
        'id-1',
        'token-123',
        0,
        21600
      );
      
      // El constructor reemplaza 0 con Date.now()
      expect(session.createdAt).toBeGreaterThan(0);
      expect(session.createdAt).toBeLessThanOrEqual(Date.now());
    });

    test('should handle very short expiration (1 second)', () => {
      const now = Date.now();
      const session = DeviceSessionEntity.fromStorage(
        'id-1',
        'token-123',
        now - 2000, // 2 segundos atrás
        1 // 1 segundo de expiración
      );
      
      expect(session.isExpired()).toBe(true);
    });

    test('should handle very long expiration (30 days)', () => {
      const now = Date.now();
      const thirtyDays = 30 * 24 * 60 * 60; // segundos
      const session = DeviceSessionEntity.fromStorage(
        'id-1',
        'token-123',
        now - (5 * 24 * 60 * 60 * 1000), // 5 días atrás
        thirtyDays
      );
      
      expect(session.isExpired()).toBe(false);
    });
  });
});
