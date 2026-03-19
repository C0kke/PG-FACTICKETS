import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Extraer parámetros de la URL
        const urlParams = new URLSearchParams(location.search);
        
        const status = urlParams.get('status');
        const paymentId = urlParams.get('payment_id');
        const paymentType = urlParams.get('payment_type');
        const merchantOrderId = urlParams.get('merchant_order_id');
        const preferenceId = urlParams.get('preference_id');
        const siteTransactionId = urlParams.get('site_transaction_id');
        const processingMode = urlParams.get('processing_mode');
        const merchantAccountId = urlParams.get('merchant_account_id');

        console.log('=== PAYMENT CONFIRMATION PARAMS ===');
        console.log('Status:', status);
        console.log('Payment ID:', paymentId);
        console.log('Payment Type:', paymentType);
        console.log('Merchant Order ID:', merchantOrderId);
        console.log('Preference ID:', preferenceId);
        console.log('Site Transaction ID:', siteTransactionId);
        console.log('Processing Mode:', processingMode);
        console.log('Merchant Account ID:', merchantAccountId);
        console.log('===================================');

        const info = {
            status,
            paymentId,
            paymentType,
            merchantOrderId,
            preferenceId,
            siteTransactionId,
            processingMode,
            merchantAccountId,
            timestamp: new Date().toISOString()
        };

        setPaymentInfo(info);
        setLoading(false);

        // Si el pago fue aprobado, podrías hacer una llamada al backend para confirmar
        if (status === 'approved' && paymentId) {
            // Aquí podrías hacer una llamada a tu backend para procesar el pago exitoso
            console.log('Pago aprobado - procesando...');
            // processPaidTicket(paymentId, preferenceId);
        }
    }, [location.search]);

    const getStatusMessage = (status) => {
        switch (status) {
            case 'approved':
                return {
                    title: '¡Pago Exitoso!',
                    message: 'Tu pago ha sido procesado correctamente.',
                    color: 'text-green-600',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200'
                };
            case 'pending':
                return {
                    title: 'Pago Pendiente',
                    message: 'Tu pago está siendo procesado. Te notificaremos cuando se complete.',
                    color: 'text-yellow-600',
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200'
                };
            case 'in_process':
                return {
                    title: 'Pago en Proceso',
                    message: 'Tu pago está siendo verificado.',
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200'
                };
            case 'rejected':
                return {
                    title: 'Pago Rechazado',
                    message: 'Tu pago no pudo ser procesado. Por favor, intenta nuevamente.',
                    color: 'text-red-600',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200'
                };
            default:
                return {
                    title: 'Estado Desconocido',
                    message: 'No pudimos determinar el estado de tu pago.',
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-200'
                };
        }
    };

    const handleContinue = () => {
        if (paymentInfo?.status === 'approved') {
            navigate('/my-tickets');
        } else {
            navigate('/available-events');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const statusInfo = getStatusMessage(paymentInfo?.status);

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4">
            <div className="max-w-lg mx-auto">
                <div className={`${statusInfo.bgColor} ${statusInfo.borderColor} border rounded-lg p-6 shadow-lg`}>
                    <div className="text-center mb-6">
                        <h1 className={`text-3xl font-bold ${statusInfo.color} mb-2`}>
                            {statusInfo.title}
                        </h1>
                        <p className="text-gray-700">
                            {statusInfo.message}
                        </p>
                    </div>

                    {paymentInfo && (
                        <div className="bg-white rounded-lg p-4 mb-6">
                            <h2 className="text-lg font-semibold mb-3">Detalles del Pago</h2>
                            <div className="space-y-2 text-sm">
                                {paymentInfo.paymentId && (
                                    <div className="flex justify-between">
                                        <span className="font-medium">ID de Pago:</span>
                                        <span className="text-gray-600">{paymentInfo.paymentId}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="font-medium">Estado:</span>
                                    <span className={`${statusInfo.color} font-medium`}>
                                        {paymentInfo.status}
                                    </span>
                                </div>
                                {paymentInfo.paymentType && (
                                    <div className="flex justify-between">
                                        <span className="font-medium">Tipo de Pago:</span>
                                        <span className="text-gray-600">{paymentInfo.paymentType}</span>
                                    </div>
                                )}
                                {paymentInfo.preferenceId && (
                                    <div className="flex justify-between">
                                        <span className="font-medium">ID Preferencia:</span>
                                        <span className="text-gray-600 text-xs">{paymentInfo.preferenceId}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="font-medium">Fecha:</span>
                                    <span className="text-gray-600">
                                        {new Date(paymentInfo.timestamp).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="text-center">
                        <button
                            onClick={handleContinue}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                        >
                            {paymentInfo?.status === 'approved' ? 'Ver Mis Tickets' : 'Volver a Eventos'}
                        </button>
                    </div>
                </div>

                {/* Debug info en desarrollo */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-6 bg-gray-800 text-white p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Debug Info</h3>
                        <pre className="text-xs overflow-auto">
                            {JSON.stringify(paymentInfo, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentConfirmation;