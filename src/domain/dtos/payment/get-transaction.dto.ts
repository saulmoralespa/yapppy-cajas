/**
 * Get Transaction DTO
 * 
 * Valida el transactionId para consultar una transacción
 */
export class GetTransactionDto {
    
    private constructor(
        public readonly transactionId: string
    ) {}

    /**
     * Factory method con validación
     * 
     * Retorna tuple: [error?, dto?]
     */
    static create(object: { [key: string]: any }): [string?, GetTransactionDto?] {
        const { transactionId } = object;

        // Validación: transactionId requerido
        if (!transactionId) {
            return ['transactionId is required'];
        }

        // Validación: debe ser string
        if (typeof transactionId !== 'string') {
            return ['transactionId must be a string'];
        }

        // Validación: no puede estar vacío
        if (transactionId.trim().length === 0) {
            return ['transactionId cannot be empty'];
        }

        // Validación: longitud mínima (transactionId de Yappy son UUID o similar)
        if (transactionId.length < 10) {
            return ['transactionId must be at least 10 characters'];
        }

        return [undefined, new GetTransactionDto(transactionId.trim())];
    }
}
