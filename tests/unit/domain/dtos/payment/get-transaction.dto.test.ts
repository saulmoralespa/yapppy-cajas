import { describe, test, expect } from 'vitest';
import { GetTransactionDto } from '../../../../../src/domain/dtos/payment/get-transaction.dto';

describe('GetTransactionDto', () => {
  describe('Validaciones de campos requeridos', () => {
    test('should reject missing transactionId', () => {
      const [error] = GetTransactionDto.create({});
      
      expect(error).toBe('transactionId is required');
    });

    test('should reject undefined transactionId', () => {
      const [error] = GetTransactionDto.create({ transactionId: undefined });
      
      expect(error).toBe('transactionId is required');
    });

    test('should reject null transactionId', () => {
      const [error] = GetTransactionDto.create({ transactionId: null });
      
      expect(error).toBe('transactionId is required');
    });
  });

  describe('Validaciones de tipo', () => {
    test('should reject non-string transactionId', () => {
      const [error] = GetTransactionDto.create({ transactionId: 123 });
      
      expect(error).toBe('transactionId must be a string');
    });

    test('should reject number transactionId', () => {
      const [error] = GetTransactionDto.create({ transactionId: 12345678901 });
      
      expect(error).toBe('transactionId must be a string');
    });

    test('should reject object transactionId', () => {
      const [error] = GetTransactionDto.create({ transactionId: {} });
      
      expect(error).toBe('transactionId must be a string');
    });

    test('should reject array transactionId', () => {
      const [error] = GetTransactionDto.create({ transactionId: ['TXN-123'] });
      
      expect(error).toBe('transactionId must be a string');
    });
  });

  describe('Validaciones de contenido', () => {
    test('should reject empty string', () => {
      const [error] = GetTransactionDto.create({ transactionId: '' });
      
      // String vacío es falsy, entonces retorna el primer error
      expect(error).toBe('transactionId is required');
    });

    test('should reject whitespace-only string', () => {
      const [error] = GetTransactionDto.create({ transactionId: '   ' });
      
      expect(error).toBe('transactionId cannot be empty');
    });

    test('should reject short transactionId (< 10 chars)', () => {
      const [error] = GetTransactionDto.create({ transactionId: 'TXN-123' });
      
      expect(error).toBe('transactionId must be at least 10 characters');
    });

    test('should reject 9 character transactionId', () => {
      const [error] = GetTransactionDto.create({ transactionId: '123456789' });
      
      expect(error).toBe('transactionId must be at least 10 characters');
    });
  });

  describe('Casos exitosos', () => {
    test('should create DTO with valid 10-character transactionId', () => {
      const [error, dto] = GetTransactionDto.create({ 
        transactionId: '1234567890' 
      });
      
      expect(error).toBeUndefined();
      expect(dto).toBeDefined();
      expect(dto?.transactionId).toBe('1234567890');
    });

    test('should create DTO with typical transactionId', () => {
      const [error, dto] = GetTransactionDto.create({ 
        transactionId: 'TXN-123456789' 
      });
      
      expect(error).toBeUndefined();
      expect(dto).toBeDefined();
      expect(dto?.transactionId).toBe('TXN-123456789');
    });

    test('should create DTO with UUID format', () => {
      const [error, dto] = GetTransactionDto.create({ 
        transactionId: '550e8400-e29b-41d4-a716-446655440000' 
      });
      
      expect(error).toBeUndefined();
      expect(dto?.transactionId).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    test('should trim whitespace from transactionId', () => {
      const [error, dto] = GetTransactionDto.create({ 
        transactionId: '  TXN-123456789  ' 
      });
      
      expect(error).toBeUndefined();
      expect(dto?.transactionId).toBe('TXN-123456789');
    });

    test('should handle leading whitespace', () => {
      const [error, dto] = GetTransactionDto.create({ 
        transactionId: '     1234567890' 
      });
      
      expect(error).toBeUndefined();
      expect(dto?.transactionId).toBe('1234567890');
    });

    test('should handle trailing whitespace', () => {
      const [error, dto] = GetTransactionDto.create({ 
        transactionId: '1234567890     ' 
      });
      
      expect(error).toBeUndefined();
      expect(dto?.transactionId).toBe('1234567890');
    });
  });

  describe('Casos edge', () => {
    test('should accept exactly 10 characters', () => {
      const [error, dto] = GetTransactionDto.create({ 
        transactionId: 'A'.repeat(10) 
      });
      
      expect(error).toBeUndefined();
      expect(dto).toBeDefined();
    });

    test('should accept very long transactionId', () => {
      const longId = 'TXN-' + 'A'.repeat(100);
      const [error, dto] = GetTransactionDto.create({ 
        transactionId: longId 
      });
      
      expect(error).toBeUndefined();
      expect(dto?.transactionId).toBe(longId);
    });

    test('should accept special characters', () => {
      const [error, dto] = GetTransactionDto.create({ 
        transactionId: 'TXN_123-456.789' 
      });
      
      expect(error).toBeUndefined();
      expect(dto?.transactionId).toBe('TXN_123-456.789');
    });
  });
});
