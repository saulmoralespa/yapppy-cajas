/**
 * Cancel Transaction DTO
 * 
 * Valida el transactionId para cancelar una transacción
 */
export class CancelTransactionDto {
    
    private constructor(
        public readonly transactionId: string
    ) {}

    /**
     * Factory method con validación
     * 
     * Retorna tuple: [error?, dto?]
     */
    static create(object: { [key: string]: any }): [string?, CancelTransactionDto?] {
        const { transactionId, transaction_id } = object;

        // Aceptar tanto transactionId como transaction_id
        const txId = transactionId || transaction_id;

        // Validación: transactionId requerido
        if (!txId) {
            return ['transactionId is required'];
        }

        // Validación: debe ser string
        if (typeof txId !== 'string') {
            return ['transactionId must be a string'];
        }

        // Validación: no puede estar vacío
        if (txId.trim().length === 0) {
            return ['transactionId cannot be empty'];
        }

        // Validación: longitud mínima (transactionId de Yappy son UUID o similar)
        if (txId.length < 10) {
            return ['transactionId must be at least 10 characters'];
        }

        return [undefined, new CancelTransactionDto(txId.trim())];
    }
}
