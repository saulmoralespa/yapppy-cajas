import { describe, test, expect } from 'vitest';
import { CancelTransactionDto } from '../../../../../src/domain/dtos/payment/cancel-transaction.dto';

describe('CancelTransactionDto', () => {
  describe('Validaciones de campos requeridos', () => {
    test('should reject missing transactionId', () => {
      const [error] = CancelTransactionDto.create({});
      
      expect(error).toBe('transactionId is required');
    });

    test('should reject undefined transactionId', () => {
      const [error] = CancelTransactionDto.create({ transactionId: undefined });
      
      expect(error).toBe('transactionId is required');
    });

    test('should reject null transactionId', () => {
      const [error] = CancelTransactionDto.create({ transactionId: null });
      
      expect(error).toBe('transactionId is required');
    });
  });

  describe('Validaciones de tipo', () => {
    test('should reject non-string transactionId', () => {
      const [error] = CancelTransactionDto.create({ transactionId: 123 });
      
      expect(error).toBe('transactionId must be a string');
    });

    test('should reject number transactionId', () => {
      const [error] = CancelTransactionDto.create({ transactionId: 12345678901 });
      
      expect(error).toBe('transactionId must be a string');
    });

    test('should reject object transactionId', () => {
      const [error] = CancelTransactionDto.create({ transactionId: {} });
      
      expect(error).toBe('transactionId must be a string');
    });

    test('should reject array transactionId', () => {
      const [error] = CancelTransactionDto.create({ transactionId: ['TXN-123'] });
      
      expect(error).toBe('transactionId must be a string');
    });

    test('should reject boolean transactionId', () => {
      const [error] = CancelTransactionDto.create({ transactionId: true });
      
      expect(error).toBe('transactionId must be a string');
    });
  });

  describe('Validaciones de contenido', () => {
    test('should reject empty string', () => {
      const [error] = CancelTransactionDto.create({ transactionId: '' });
      
      expect(error).toBe('transactionId is required');
    });

    test('should reject whitespace-only string', () => {
      const [error] = CancelTransactionDto.create({ transactionId: '   ' });
      
      expect(error).toBe('transactionId cannot be empty');
    });

    test('should reject short transactionId (< 10 chars)', () => {
      const [error] = CancelTransactionDto.create({ transactionId: 'TXN-123' });
      
      expect(error).toBe('transactionId must be at least 10 characters');
    });

    test('should reject 9 character transactionId', () => {
      const [error] = CancelTransactionDto.create({ transactionId: '123456789' });
      
      expect(error).toBe('transactionId must be at least 10 characters');
    });
  });

  describe('Casos exitosos', () => {
    test('should create DTO with valid 10-character transactionId', () => {
      const [error, dto] = CancelTransactionDto.create({ 
        transactionId: '1234567890' 
      });
      
      expect(error).toBeUndefined();
      expect(dto).toBeDefined();
      expect(dto?.transactionId).toBe('1234567890');
    });

    test('should create DTO with typical transactionId', () => {
      const [error, dto] = CancelTransactionDto.create({ 
        transactionId: 'TXN-987654321' 
      });
      
      expect(error).toBeUndefined();
      expect(dto).toBeDefined();
      expect(dto?.transactionId).toBe('TXN-987654321');
    });

    test('should create DTO with UUID format', () => {
      const [error, dto] = CancelTransactionDto.create({ 
        transactionId: '550e8400-e29b-41d4-a716-446655440000' 
      });
      
      expect(error).toBeUndefined();
      expect(dto?.transactionId).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    test('should trim whitespace from transactionId', () => {
      const [error, dto] = CancelTransactionDto.create({ 
        transactionId: '  TXN-123456789  ' 
      });
      
      expect(error).toBeUndefined();
      expect(dto?.transactionId).toBe('TXN-123456789');
    });

    test('should handle leading whitespace', () => {
      const [error, dto] = CancelTransactionDto.create({ 
        transactionId: '     1234567890' 
      });
      
      expect(error).toBeUndefined();
      expect(dto?.transactionId).toBe('1234567890');
    });

    test('should handle trailing whitespace', () => {
      const [error, dto] = CancelTransactionDto.create({ 
        transactionId: '1234567890     ' 
      });
      
      expect(error).toBeUndefined();
      expect(dto?.transactionId).toBe('1234567890');
    });
  });

  describe('Compatibilidad con snake_case', () => {
    test('should accept transaction_id (snake_case)', () => {
      const [error, dto] = CancelTransactionDto.create({ 
        transaction_id: 'TXN-123456789' 
      });
      
      expect(error).toBeUndefined();
      expect(dto?.transactionId).toBe('TXN-123456789');
    });

    test('should prioritize transactionId over transaction_id', () => {
      const [error, dto] = CancelTransactionDto.create({ 
        transactionId: 'TXN-PRIORITY',
        transaction_id: 'TXN-SECONDARY' 
      });
      
      expect(error).toBeUndefined();
      expect(dto?.transactionId).toBe('TXN-PRIORITY');
    });

    test('should trim transaction_id (snake_case)', () => {
      const [error, dto] = CancelTransactionDto.create({ 
        transaction_id: '  TXN-123456789  ' 
      });
      
      expect(error).toBeUndefined();
      expect(dto?.transactionId).toBe('TXN-123456789');
    });

    test('should validate transaction_id length', () => {
      const [error] = CancelTransactionDto.create({ 
        transaction_id: 'TXN-12' 
      });
      
      expect(error).toBe('transactionId must be at least 10 characters');
    });
  });

  describe('Casos edge', () => {
    test('should accept exactly 10 characters', () => {
      const [error, dto] = CancelTransactionDto.create({ 
        transactionId: 'A'.repeat(10) 
      });
      
      expect(error).toBeUndefined();
      expect(dto).toBeDefined();
    });

    test('should accept very long transactionId', () => {
      const longId = 'TXN-' + 'A'.repeat(100);
      const [error, dto] = CancelTransactionDto.create({ 
        transactionId: longId 
      });
      
      expect(error).toBeUndefined();
      expect(dto?.transactionId).toBe(longId);
    });

    test('should accept special characters', () => {
      const [error, dto] = CancelTransactionDto.create({ 
        transactionId: 'TXN_123-456.789' 
      });
      
      expect(error).toBeUndefined();
      expect(dto?.transactionId).toBe('TXN_123-456.789');
    });

    test('should accept alphanumeric with hyphens', () => {
      const [error, dto] = CancelTransactionDto.create({ 
        transactionId: 'CANCEL-2025-12-08-001' 
      });
      
      expect(error).toBeUndefined();
      expect(dto?.transactionId).toBe('CANCEL-2025-12-08-001');
    });
  });

  describe('Casos de uso real', () => {
    test('should validate transactionId for cancellation request', () => {
      const [error, dto] = CancelTransactionDto.create({ 
        transactionId: 'TXN-PENDING-123456' 
      });
      
      expect(error).toBeUndefined();
      expect(dto).toBeDefined();
      expect(dto?.transactionId).toBe('TXN-PENDING-123456');
    });

    test('should handle Yappy-style transaction IDs', () => {
      const [error, dto] = CancelTransactionDto.create({ 
        transactionId: 'YPY-20251208-ABCD1234' 
      });
      
      expect(error).toBeUndefined();
      expect(dto?.transactionId).toBe('YPY-20251208-ABCD1234');
    });
  });
});
