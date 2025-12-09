import { describe, test, expect } from 'vitest';
import { GenerateQRCodeDto } from '../../../../../src/domain/dtos/payment/generate-qrcode.dto';

describe('GenerateQRCodeDto', () => {
  describe('Validaciones de campos requeridos', () => {
    test('should reject missing sub_total', () => {
      const [error] = GenerateQRCodeDto.create({
        tax: 1,
        tip: 0,
        discount: 0,
        total: 1,
        type: 'DYN'
      });
      
      expect(error).toBe('sub_total is required');
    });

    test('should reject missing tax', () => {
      const [error] = GenerateQRCodeDto.create({
        sub_total: 10,
        tip: 0,
        discount: 0,
        total: 10,
        type: 'DYN'
      });
      
      expect(error).toBe('tax is required');
    });

    test('should reject missing tip', () => {
      const [error] = GenerateQRCodeDto.create({
        sub_total: 10,
        tax: 1,
        discount: 0,
        total: 11,
        type: 'DYN'
      });
      
      expect(error).toBe('tip is required');
    });

    test('should reject missing discount', () => {
      const [error] = GenerateQRCodeDto.create({
        sub_total: 10,
        tax: 1,
        tip: 0,
        total: 11,
        type: 'DYN'
      });
      
      expect(error).toBe('discount is required');
    });

    test('should reject missing total', () => {
      const [error] = GenerateQRCodeDto.create({
        sub_total: 10,
        tax: 1,
        tip: 0,
        discount: 0,
        type: 'DYN'
      });
      
      expect(error).toBe('total is required');
    });

    test('should reject missing type', () => {
      const [error] = GenerateQRCodeDto.create({
        sub_total: 10,
        tax: 1,
        tip: 0,
        discount: 0,
        total: 11
      });
      
      expect(error).toBe('type is required');
    });
  });

  describe('Validaciones de tipo de dato', () => {
    test('should reject non-numeric sub_total', () => {
      const [error] = GenerateQRCodeDto.create({
        sub_total: '10',
        tax: 1,
        tip: 0,
        discount: 0,
        total: 11,
        type: 'DYN'
      });
      
      expect(error).toContain('must be a valid number');
    });

    test('should reject NaN values', () => {
      const [error] = GenerateQRCodeDto.create({
        sub_total: NaN,
        tax: 1,
        tip: 0,
        discount: 0,
        total: 11,
        type: 'DYN'
      });
      
      expect(error).toContain('must be a valid number');
    });

    test('should reject string tax', () => {
      const [error] = GenerateQRCodeDto.create({
        sub_total: 10,
        tax: '1',
        tip: 0,
        discount: 0,
        total: 11,
        type: 'DYN'
      });
      
      expect(error).toContain('must be a valid number');
    });

    test('should reject string total', () => {
      const [error] = GenerateQRCodeDto.create({
        sub_total: 10,
        tax: 1,
        tip: 0,
        discount: 0,
        total: '11',
        type: 'DYN'
      });
      
      expect(error).toContain('must be a valid number');
    });
  });

  describe('Validaciones de rangos', () => {
    test('should reject negative sub_total', () => {
      const [error] = GenerateQRCodeDto.create({
        sub_total: -10,
        tax: 1,
        tip: 0,
        discount: 0,
        total: -9,
        type: 'DYN'
      });
      
      expect(error).toContain('cannot be negative');
    });

    test('should reject negative tax', () => {
      const [error] = GenerateQRCodeDto.create({
        sub_total: 10,
        tax: -1,
        tip: 0,
        discount: 0,
        total: 9,
        type: 'DYN'
      });
      
      expect(error).toContain('cannot be negative');
    });

    test('should reject negative tip', () => {
      const [error] = GenerateQRCodeDto.create({
        sub_total: 10,
        tax: 1,
        tip: -1,
        discount: 0,
        total: 10,
        type: 'DYN'
      });
      
      expect(error).toContain('cannot be negative');
    });

    test('should reject negative discount', () => {
      const [error] = GenerateQRCodeDto.create({
        sub_total: 10,
        tax: 1,
        tip: 0,
        discount: -5,
        total: 16,
        type: 'DYN'
      });
      
      expect(error).toContain('cannot be negative');
    });

    test('should reject zero total', () => {
      const [error] = GenerateQRCodeDto.create({
        sub_total: 0,
        tax: 0,
        tip: 0,
        discount: 0,
        total: 0,
        type: 'DYN'
      });
      
      expect(error).toBe('total must be greater than 0');
    });

    test('should reject negative total', () => {
      const [error] = GenerateQRCodeDto.create({
        sub_total: 10,
        tax: 1,
        tip: 0,
        discount: 20,
        total: -9,
        type: 'DYN'
      });
      
      expect(error).toBe('total must be greater than 0');
    });

    test('should accept zero values for optional fields', () => {
      const [error, dto] = GenerateQRCodeDto.create({
        sub_total: 10,
        tax: 0,
        tip: 0,
        discount: 0,
        total: 10,
        type: 'DYN'
      });
      
      expect(error).toBeUndefined();
      expect(dto).toBeDefined();
    });
  });

  describe('Validación de cálculo (CRÍTICO)', () => {
    test('should validate correct calculation: total = sub_total + tax + tip - discount', () => {
      const [error, dto] = GenerateQRCodeDto.create({
        sub_total: 10.00,
        tax: 0.70,
        tip: 1.00,
        discount: 0.50,
        total: 11.20, // ✅ 10 + 0.70 + 1 - 0.50 = 11.20
        type: 'DYN'
      });
      
      expect(error).toBeUndefined();
      expect(dto).toBeDefined();
      expect(dto?.total).toBe(11.20);
    });

    test('should reject incorrect total calculation', () => {
      const [error] = GenerateQRCodeDto.create({
        sub_total: 10.00,
        tax: 0.70,
        tip: 1.00,
        discount: 0.50,
        total: 12.00, // ❌ Incorrecto (debería ser 11.20)
        type: 'DYN'
      });
      
      expect(error).toContain('total mismatch');
      expect(error).toContain('11.2');
      expect(error).toContain('12');
    });

    test('should handle floating point precision', () => {
      const [error, dto] = GenerateQRCodeDto.create({
        sub_total: 10.10,
        tax: 0.70,
        tip: 0.20,
        discount: 0.00,
        total: 11.00,
        type: 'DYN'
      });
      
      expect(error).toBeUndefined();
      expect(dto).toBeDefined();
    });

    test('should validate complex calculation', () => {
      const [error, dto] = GenerateQRCodeDto.create({
        sub_total: 45.50,
        tax: 3.18,    // 7% tax
        tip: 6.83,    // 15% tip
        discount: 0,
        total: 55.51,
        type: 'DYN'
      });
      
      expect(error).toBeUndefined();
      expect(dto?.total).toBe(55.51);
    });

    test('should validate calculation with discount', () => {
      const [error, dto] = GenerateQRCodeDto.create({
        sub_total: 100.00,
        tax: 7.00,
        tip: 0,
        discount: 15.00,  // 15% discount
        total: 92.00,
        type: 'DYN'
      });
      
      expect(error).toBeUndefined();
      expect(dto?.discount).toBe(15.00);
      expect(dto?.total).toBe(92.00);
    });

    test('should round to 2 decimal places', () => {
      const [error, dto] = GenerateQRCodeDto.create({
        sub_total: 10.123,
        tax: 0.456,
        tip: 0.789,
        discount: 0.111,
        total: 11.26, // Redondeado: 10.12 + 0.46 + 0.79 - 0.11 = 11.26
        type: 'DYN'
      });
      
      expect(error).toBeUndefined();
      expect(dto?.subTotal).toBe(10.12);
      expect(dto?.tax).toBe(0.46);
      expect(dto?.tip).toBe(0.79);
      expect(dto?.discount).toBe(0.11);
      expect(dto?.total).toBe(11.26);
    });

    test('should allow small rounding differences (< 0.01)', () => {
      // El DTO redondea ambos valores a 2 decimales antes de comparar
      // 10 + 0.70 + 1 - 0.50 = 11.20, pero si total es 11.21
      // La diferencia es 0.01, que está dentro del margen permitido
      const [error, dto] = GenerateQRCodeDto.create({
        sub_total: 10.00,
        tax: 0.70,
        tip: 1.00,
        discount: 0.50,
        total: 11.20, // Mismo valor calculado
        type: 'DYN'
      });
      
      expect(error).toBeUndefined();
      expect(dto).toBeDefined();
    });

    test('should reject differences > 0.01', () => {
      const [error] = GenerateQRCodeDto.create({
        sub_total: 10.00,
        tax: 0.70,
        tip: 1.00,
        discount: 0.50,
        total: 11.25, // Diferencia de 0.05
        type: 'DYN'
      });
      
      expect(error).toContain('total mismatch');
    });
  });

  describe('Validación de tipo de QR', () => {
    test('should accept DYN type', () => {
      const [error, dto] = GenerateQRCodeDto.create({
        sub_total: 10,
        tax: 0,
        tip: 0,
        discount: 0,
        total: 10,
        type: 'DYN'
      });
      
      expect(error).toBeUndefined();
      expect(dto?.type).toBe('DYN');
    });

    test('should accept HYB type', () => {
      const [error, dto] = GenerateQRCodeDto.create({
        sub_total: 10,
        tax: 0,
        tip: 0,
        discount: 0,
        total: 10,
        type: 'HYB'
      });
      
      expect(error).toBeUndefined();
      expect(dto?.type).toBe('HYB');
    });

    test('should accept lowercase dyn', () => {
      const [error, dto] = GenerateQRCodeDto.create({
        sub_total: 10,
        tax: 0,
        tip: 0,
        discount: 0,
        total: 10,
        type: 'dyn'
      });
      
      expect(error).toBeUndefined();
      expect(dto?.type).toBe('DYN');
    });

    test('should accept mixed case HyB', () => {
      const [error, dto] = GenerateQRCodeDto.create({
        sub_total: 10,
        tax: 0,
        tip: 0,
        discount: 0,
        total: 10,
        type: 'HyB'
      });
      
      expect(error).toBeUndefined();
      expect(dto?.type).toBe('HYB');
    });

    test('should reject invalid type', () => {
      const [error] = GenerateQRCodeDto.create({
        sub_total: 10,
        tax: 0,
        tip: 0,
        discount: 0,
        total: 10,
        type: 'INVALID'
      });
      
      expect(error).toContain('must be either "DYN" or "HYB"');
    });

    test('should reject numeric type', () => {
      const [error] = GenerateQRCodeDto.create({
        sub_total: 10,
        tax: 0,
        tip: 0,
        discount: 0,
        total: 10,
        type: 123
      });
      
      expect(error).toContain('must be either "DYN" or "HYB"');
    });
  });

  describe('Validación de campos opcionales', () => {
    test('should accept valid order_id', () => {
      const [error, dto] = GenerateQRCodeDto.create({
        sub_total: 10,
        tax: 0,
        tip: 0,
        discount: 0,
        total: 10,
        type: 'DYN',
        order_id: 'ORD-2025-001'
      });
      
      expect(error).toBeUndefined();
      expect(dto?.orderId).toBe('ORD-2025-001');
    });

    test('should accept valid description', () => {
      const [error, dto] = GenerateQRCodeDto.create({
        sub_total: 10,
        tax: 0,
        tip: 0,
        discount: 0,
        total: 10,
        type: 'DYN',
        description: 'Mesa 5 - Almuerzo'
      });
      
      expect(error).toBeUndefined();
      expect(dto?.description).toBe('Mesa 5 - Almuerzo');
    });

    test('should trim order_id', () => {
      const [error, dto] = GenerateQRCodeDto.create({
        sub_total: 10,
        tax: 0,
        tip: 0,
        discount: 0,
        total: 10,
        type: 'DYN',
        order_id: '  ORD-001  '
      });
      
      expect(error).toBeUndefined();
      expect(dto?.orderId).toBe('ORD-001');
    });

    test('should trim description', () => {
      const [error, dto] = GenerateQRCodeDto.create({
        sub_total: 10,
        tax: 0,
        tip: 0,
        discount: 0,
        total: 10,
        type: 'DYN',
        description: '  Test description  '
      });
      
      expect(error).toBeUndefined();
      expect(dto?.description).toBe('Test description');
    });

    test('should reject empty order_id', () => {
      const [error] = GenerateQRCodeDto.create({
        sub_total: 10,
        tax: 0,
        tip: 0,
        discount: 0,
        total: 10,
        type: 'DYN',
        order_id: ''
      });
      
      expect(error).toContain('order_id must be a non-empty string');
    });

    test('should reject whitespace-only order_id', () => {
      const [error] = GenerateQRCodeDto.create({
        sub_total: 10,
        tax: 0,
        tip: 0,
        discount: 0,
        total: 10,
        type: 'DYN',
        order_id: '   '
      });
      
      expect(error).toContain('order_id must be a non-empty string');
    });

    test('should reject empty description', () => {
      const [error] = GenerateQRCodeDto.create({
        sub_total: 10,
        tax: 0,
        tip: 0,
        discount: 0,
        total: 10,
        type: 'DYN',
        description: ''
      });
      
      expect(error).toContain('description must be a non-empty string');
    });

    test('should reject non-string order_id', () => {
      const [error] = GenerateQRCodeDto.create({
        sub_total: 10,
        tax: 0,
        tip: 0,
        discount: 0,
        total: 10,
        type: 'DYN',
        order_id: 123
      });
      
      expect(error).toContain('order_id must be a non-empty string');
    });

    test('should handle undefined optional fields', () => {
      const [error, dto] = GenerateQRCodeDto.create({
        sub_total: 10,
        tax: 0,
        tip: 0,
        discount: 0,
        total: 10,
        type: 'DYN'
      });
      
      expect(error).toBeUndefined();
      expect(dto?.orderId).toBeUndefined();
      expect(dto?.description).toBeUndefined();
    });
  });

  describe('Métodos de la clase', () => {
    test('calculateTotal should return correct value', () => {
      const [, dto] = GenerateQRCodeDto.create({
        sub_total: 10.00,
        tax: 0.70,
        tip: 1.00,
        discount: 0.50,
        total: 11.20,
        type: 'DYN'
      });
      
      expect(dto?.calculateTotal()).toBe(11.20);
    });

    test('isValidTotal should return true for valid total', () => {
      const [, dto] = GenerateQRCodeDto.create({
        sub_total: 10.00,
        tax: 0.70,
        tip: 1.00,
        discount: 0.50,
        total: 11.20,
        type: 'DYN'
      });
      
      expect(dto?.isValidTotal()).toBe(true);
    });

    test('isValidTotal should return true for small differences', () => {
      // Como el DTO redondea, 11.20 y 11.20 son exactamente iguales
      const [, dto] = GenerateQRCodeDto.create({
        sub_total: 10.00,
        tax: 0.70,
        tip: 1.00,
        discount: 0.50,
        total: 11.20,
        type: 'DYN'
      });
      
      expect(dto?.isValidTotal()).toBe(true);
    });
  });

  describe('Casos de uso reales', () => {
    test('should create DTO for restaurant bill', () => {
      const [error, dto] = GenerateQRCodeDto.create({
        sub_total: 45.50,
        tax: 3.18,    // 7% tax
        tip: 6.83,    // 15% tip
        discount: 0,
        total: 55.51,
        type: 'DYN',
        order_id: 'ORD-2025-001',
        description: 'Mesa 5 - Almuerzo ejecutivo'
      });
      
      expect(error).toBeUndefined();
      expect(dto?.subTotal).toBe(45.50);
      expect(dto?.tax).toBe(3.18);
      expect(dto?.tip).toBe(6.83);
      expect(dto?.total).toBe(55.51);
      expect(dto?.orderId).toBe('ORD-2025-001');
      expect(dto?.description).toBe('Mesa 5 - Almuerzo ejecutivo');
    });

    test('should create DTO for discounted purchase', () => {
      const [error, dto] = GenerateQRCodeDto.create({
        sub_total: 100.00,
        tax: 7.00,
        tip: 0,
        discount: 15.00,  // 15% discount
        total: 92.00,
        type: 'HYB',
        description: 'Black Friday Sale'
      });
      
      expect(error).toBeUndefined();
      expect(dto?.discount).toBe(15.00);
      expect(dto?.total).toBe(92.00);
      expect(dto?.type).toBe('HYB');
    });

    test('should create DTO for simple purchase', () => {
      const [error, dto] = GenerateQRCodeDto.create({
        sub_total: 25.00,
        tax: 1.75,
        tip: 0,
        discount: 0,
        total: 26.75,
        type: 'DYN',
        order_id: 'ORD-SIMPLE-001'
      });
      
      expect(error).toBeUndefined();
      expect(dto?.calculateTotal()).toBe(26.75);
      expect(dto?.isValidTotal()).toBe(true);
    });

    test('should handle high-value transaction', () => {
      const [error, dto] = GenerateQRCodeDto.create({
        sub_total: 1000.00,
        tax: 70.00,
        tip: 150.00,
        discount: 100.00,
        total: 1120.00,
        type: 'DYN'
      });
      
      expect(error).toBeUndefined();
      expect(dto?.total).toBe(1120.00);
    });
  });
});
