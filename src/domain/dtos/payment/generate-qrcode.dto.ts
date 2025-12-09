/**
 * DTO para generar código QR de pago
 * 
 * Valida los parámetros del checkout de Yappy
 */
export class GenerateQRCodeDto {
    
    private constructor(
        public readonly subTotal: number,
        public readonly tax: number,
        public readonly tip: number,
        public readonly discount: number,
        public readonly total: number,
        public readonly type: 'DYN' | 'HYB',
        public readonly orderId?: string,
        public readonly description?: string
    ) {}

    /**
     * Factory method con validaciones
     * 
     * @param object - Objeto con los datos del pago
     * @returns [error?, dto?] - Patrón Either para manejo de errores
     */
    static create(object: {[key: string]: any}): [string?, GenerateQRCodeDto?] {
        
        const { sub_total, tax, tip, discount, total, type, order_id, description } = object;

        // Validación: sub_total requerido
        if (sub_total === undefined || sub_total === null) {
            return ['sub_total is required'];
        }

        // Validación: sub_total debe ser número
        if (typeof sub_total !== 'number' || isNaN(sub_total)) {
            return ['sub_total must be a valid number'];
        }

        // Validación: sub_total no puede ser negativo
        if (sub_total < 0) {
            return ['sub_total cannot be negative'];
        }

        // Validación: tax requerido
        if (tax === undefined || tax === null) {
            return ['tax is required'];
        }

        // Validación: tax debe ser número
        if (typeof tax !== 'number' || isNaN(tax)) {
            return ['tax must be a valid number'];
        }

        // Validación: tax no puede ser negativo
        if (tax < 0) {
            return ['tax cannot be negative'];
        }

        // Validación: tip requerido (puede ser 0)
        if (tip === undefined || tip === null) {
            return ['tip is required'];
        }

        // Validación: tip debe ser número
        if (typeof tip !== 'number' || isNaN(tip)) {
            return ['tip must be a valid number'];
        }

        // Validación: tip no puede ser negativo
        if (tip < 0) {
            return ['tip cannot be negative'];
        }

        // Validación: discount requerido (puede ser 0)
        if (discount === undefined || discount === null) {
            return ['discount is required'];
        }

        // Validación: discount debe ser número
        if (typeof discount !== 'number' || isNaN(discount)) {
            return ['discount must be a valid number'];
        }

        // Validación: discount no puede ser negativo
        if (discount < 0) {
            return ['discount cannot be negative'];
        }

        // Validación: total requerido
        if (total === undefined || total === null) {
            return ['total is required'];
        }

        // Validación: total debe ser número
        if (typeof total !== 'number' || isNaN(total)) {
            return ['total must be a valid number'];
        }

        // Validación: total debe ser mayor que 0
        if (total <= 0) {
            return ['total must be greater than 0'];
        }

        // Validación: type requerido
        if (!type) {
            return ['type is required'];
        }

        const upperType = type.toString().trim().toUpperCase();
        if (upperType !== 'DYN' && upperType !== 'HYB') {
            return ['type must be either "DYN" or "HYB"'];
        }

        // Validación lógica: total debe ser igual a sub_total + tax + tip - discount
        const calculatedTotal = Number((sub_total + tax + tip - discount).toFixed(2));
        const providedTotal = Number(total.toFixed(2));

        if (Math.abs(calculatedTotal - providedTotal) > 0.01) {
            return [`total mismatch: expected ${calculatedTotal} but got ${providedTotal}`];
        }

        // Validación: order_id opcional pero si existe debe ser string no vacío
        if (order_id !== undefined && order_id !== null) {
            if (typeof order_id !== 'string' || order_id.trim() === '') {
                return ['order_id must be a non-empty string if provided'];
            }
        }

        // Validación: description opcional pero si existe debe ser string no vacío
        if (description !== undefined && description !== null) {
            if (typeof description !== 'string' || description.trim() === '') {
                return ['description must be a non-empty string if provided'];
            }
        }
        
        return [
            undefined,
            new GenerateQRCodeDto(
                Number(sub_total.toFixed(2)),
                Number(tax.toFixed(2)),
                Number(tip.toFixed(2)),
                Number(discount.toFixed(2)),
                Number(total.toFixed(2)),
                upperType as 'DYN' | 'HYB',
                order_id?.trim(),
                description?.trim()
            )
        ];
    }

    /**
     * Calcula el total esperado
     */
    calculateTotal(): number {
        return Number((this.subTotal + this.tax + this.tip - this.discount).toFixed(2));
    }

    /**
     * Verifica si el total es válido
     */
    isValidTotal(): boolean {
        return Math.abs(this.calculateTotal() - this.total) < 0.01;
    }
}
