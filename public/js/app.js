/**
 * Yappy Payment - QR Code Generator
 * Application Logic
 */

// Auto-calculate total
function calculateTotal() {
    const subTotal = parseFloat(document.getElementById('subTotal').value) || 0;
    const tax = parseFloat(document.getElementById('tax').value) || 0;
    const tip = parseFloat(document.getElementById('tip').value) || 0;
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    
    const total = subTotal + tax + tip - discount;
    document.getElementById('total').value = total.toFixed(2);
}

// Add event listeners for auto-calculation
['subTotal', 'tax', 'tip', 'discount'].forEach(id => {
    document.getElementById(id).addEventListener('input', calculateTotal);
});

// Generate QR Code
document.getElementById('generateBtn').addEventListener('click', async function() {
    this.disabled = true;
    this.textContent = 'Generando...';
    hideError();

    try {
        const payload = {
            sub_total: parseFloat(document.getElementById('subTotal').value),
            tax: parseFloat(document.getElementById('tax').value),
            tip: parseFloat(document.getElementById('tip').value),
            discount: parseFloat(document.getElementById('discount').value),
            total: parseFloat(document.getElementById('total').value),
            order_id: document.getElementById('orderId').value || undefined,
            description: document.getElementById('description').value || undefined
        };

        const response = await fetch('/api/generate-qrcode/DYN', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.ok) {
            // Display payment info
            document.getElementById('displayAmount').textContent = data.data.amount.toFixed(2);
            document.getElementById('displayTxId').textContent = data.data.transactionId;
            document.getElementById('displayOrderId').textContent = data.data.orderId || '-';
            
            // Generate QR code from hash
            const canvas = document.getElementById('qrCanvas');
            await QRCode.toCanvas(canvas, data.data.qrCodeUrl, {
                width: 256,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });
            
            // Show QR section
            document.getElementById('paymentSection').style.display = 'none';
            document.getElementById('qrSection').classList.add('active');
        } else {
            showError(data.error || 'Error al generar el código QR');
            this.disabled = false;
            this.textContent = 'Generar Código QR';
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error de conexión: ' + error.message);
        this.disabled = false;
        this.textContent = 'Generar Código QR';
    }
});

// Check transaction status
async function checkTransactionStatus() {
    const transactionId = document.getElementById('displayTxId').textContent;
    
    if (!transactionId || transactionId === '-') {
        showError('No hay transacción para consultar');
        return;
    }

    const checkBtn = document.getElementById('checkStatusBtn');
    const originalText = checkBtn.textContent;
    checkBtn.disabled = true;
    checkBtn.textContent = 'Consultando...';
    hideError();

    try {
        const response = await fetch(`/api/transaction/${transactionId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.ok) {
            const statusDiv = document.getElementById('statusPending');
            const status = data.data.status;
            
            // Update status display with color coding
            if (status === 'COMPLETED' || status === 'SUCCESS') {
                statusDiv.innerHTML = '<span>✅ Pago completado exitosamente</span>';
                statusDiv.className = 'status-success';
            } else if (status === 'CANCELLED' || status === 'CANCELED') {
                statusDiv.innerHTML = '<span>❌ Transacción cancelada</span>';
                statusDiv.className = 'status-cancelled';
            } else if (status === 'PENDING') {
                statusDiv.innerHTML = '<span>💳 Esperando pago en Yappy</span>';
                statusDiv.className = 'status-pending';
            } else {
                statusDiv.innerHTML = `<span>ℹ️ Estado: ${status}</span>`;
                statusDiv.className = 'status-info';
            }
            
            // Show additional info if available
            if (data.data.completedAt) {
                showError(`Completado: ${new Date(data.data.completedAt).toLocaleString('es-PA')}`);
            }
        } else {
            showError(data.error || 'Error al consultar el estado');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error de conexión: ' + error.message);
    } finally {
        checkBtn.disabled = false;
        checkBtn.textContent = originalText;
    }
}

// Cancel transaction
async function cancelTransaction() {
    const transactionId = document.getElementById('displayTxId').textContent;
    
    if (!transactionId || transactionId === '-') {
        showError('No hay transacción para cancelar');
        return;
    }

    if (!confirm('¿Estás seguro de que deseas cancelar esta transacción?')) {
        return;
    }

    const cancelBtn = document.getElementById('cancelTxBtn');
    const originalText = cancelBtn.textContent;
    cancelBtn.disabled = true;
    cancelBtn.textContent = 'Cancelando...';
    hideError();

    try {
        const response = await fetch(`/api/transaction/${transactionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.ok) {
            const statusDiv = document.getElementById('statusPending');
            statusDiv.innerHTML = '<span>❌ Transacción cancelada exitosamente</span>';
            statusDiv.className = 'status-cancelled';
            
            // Disable cancel button after successful cancellation
            cancelBtn.disabled = true;
            cancelBtn.textContent = '✓ Cancelada';
            
            showError(data.message || 'Transacción cancelada exitosamente');
        } else {
            showError(data.error || 'Error al cancelar la transacción');
            cancelBtn.disabled = false;
            cancelBtn.textContent = originalText;
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error de conexión: ' + error.message);
        cancelBtn.disabled = false;
        cancelBtn.textContent = originalText;
    }
}

// Event listeners for transaction actions
document.getElementById('checkStatusBtn').addEventListener('click', checkTransactionStatus);
document.getElementById('cancelTxBtn').addEventListener('click', cancelTransaction);

function resetPayment() {
    // Reset UI
    document.getElementById('qrSection').classList.remove('active');
    document.getElementById('paymentSection').style.display = 'block';
    document.getElementById('generateBtn').disabled = false;
    document.getElementById('generateBtn').textContent = 'Generar Código QR';
    
    // Reset transaction action buttons
    const checkBtn = document.getElementById('checkStatusBtn');
    const cancelBtn = document.getElementById('cancelTxBtn');
    checkBtn.disabled = false;
    checkBtn.textContent = '🔍 Consultar Estado';
    cancelBtn.disabled = false;
    cancelBtn.textContent = '❌ Cancelar Transacción';
    
    // Reset status display
    const statusDiv = document.getElementById('statusPending');
    statusDiv.innerHTML = '<span>💳 Esperando pago en Yappy</span>';
    statusDiv.className = 'status-pending';
    
    hideError();
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function hideError() {
    document.getElementById('errorMessage').style.display = 'none';
}

// Close Register functionality
document.getElementById('closeRegisterBtn').addEventListener('click', async function() {
    if (!confirm('¿Estás seguro de que deseas cerrar las cajas? Esta acción finalizará la sesión actual.')) {
        return;
    }

    const btn = this;
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '⏳ Cerrando...';
    hideError();

    try {
        const response = await fetch('/api/close-device', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.ok) {
            // Show summary in modal
            document.getElementById('summaryTransactions').textContent = data.data.transactions || 0;
            document.getElementById('summaryAmount').textContent = (data.data.amount || 0).toFixed(2);
            document.getElementById('closeSummaryModal').style.display = 'flex';
            
            // Reset payment form if in progress
            if (document.getElementById('qrSection').classList.contains('active')) {
                resetPayment();
            }
        } else {
            showError(data.error || 'Error al cerrar las cajas');
            btn.disabled = false;
            btn.textContent = originalText;
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error de conexión: ' + error.message);
        btn.disabled = false;
        btn.textContent = originalText;
    }
});

function closeModal() {
    document.getElementById('closeSummaryModal').style.display = 'none';
    
    // Re-enable the close register button
    const btn = document.getElementById('closeRegisterBtn');
    btn.disabled = false;
    btn.textContent = '🏪 Cerrar Cajas';
}

// Close modal when clicking outside
document.getElementById('closeSummaryModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});
