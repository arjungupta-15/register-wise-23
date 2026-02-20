import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, CheckCircle } from "lucide-react";

interface PaymentReceiptProps {
  student: {
    name: string;
    mobile: string;
    email?: string;
    registration_id?: number;
  };
  payment: {
    order_id: string;
    amount: number;
    payment_type: string;
    installment_number?: number;
    payment_time: string;
    transaction_id?: string;
  };
  courses?: { name: string; fee?: string }[];
}

const PaymentReceipt = ({ student, payment, courses }: PaymentReceiptProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (!receiptRef.current) return;

    // Use html2canvas or jsPDF for PDF generation
    // For now, we'll use print functionality
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const receiptHTML = receiptRef.current.innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt - ${payment.order_id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .receipt-container {
              border: 2px solid #000;
              padding: 30px;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #1e40af;
              margin-bottom: 5px;
            }
            .subtitle {
              font-size: 14px;
              color: #666;
            }
            .receipt-title {
              text-align: center;
              font-size: 24px;
              font-weight: bold;
              margin: 20px 0;
              color: #059669;
            }
            .section {
              margin: 20px 0;
            }
            .section-title {
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 10px;
              color: #1e40af;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px dashed #ddd;
            }
            .info-label {
              font-weight: 600;
              color: #333;
            }
            .info-value {
              color: #666;
            }
            .amount-box {
              background: #f0fdf4;
              border: 2px solid #059669;
              padding: 15px;
              text-align: center;
              margin: 20px 0;
              border-radius: 8px;
            }
            .amount-label {
              font-size: 14px;
              color: #666;
            }
            .amount-value {
              font-size: 32px;
              font-weight: bold;
              color: #059669;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #000;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            .stamp {
              text-align: right;
              margin-top: 40px;
              font-style: italic;
              color: #999;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${receiptHTML}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentTypeText = () => {
    if (payment.payment_type === 'onetime') return 'Full Payment';
    return `Installment ${payment.installment_number || 1}`;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Payment Receipt</h2>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Download Receipt
          </Button>
        </div>

        <div ref={receiptRef} className="receipt-container">
          {/* Header */}
          <div className="header">
            <div className="logo">TARS EDUCATION</div>
            <div className="subtitle">Professional Computer Training Institute</div>
            <div className="subtitle">Website: tarseducation.in</div>
          </div>

          {/* Receipt Title */}
          <div className="receipt-title">
            <CheckCircle className="inline h-8 w-8 text-green-600 mr-2" />
            PAYMENT RECEIPT
          </div>

          {/* Receipt Details */}
          <div className="section">
            <div className="section-title">Receipt Information</div>
            <div className="info-row">
              <span className="info-label">Receipt No:</span>
              <span className="info-value">{payment.order_id}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Date & Time:</span>
              <span className="info-value">{formatDate(payment.payment_time)}</span>
            </div>
            {payment.transaction_id && (
              <div className="info-row">
                <span className="info-label">Transaction ID:</span>
                <span className="info-value">{payment.transaction_id}</span>
              </div>
            )}
          </div>

          {/* Student Details */}
          <div className="section">
            <div className="section-title">Student Information</div>
            <div className="info-row">
              <span className="info-label">Registration ID:</span>
              <span className="info-value">REG-{student.registration_id || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Name:</span>
              <span className="info-value">{student.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Mobile:</span>
              <span className="info-value">{student.mobile}</span>
            </div>
            {student.email && (
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{student.email}</span>
              </div>
            )}
          </div>

          {/* Course Details */}
          {courses && courses.length > 0 && (
            <div className="section">
              <div className="section-title">Enrolled Courses</div>
              {courses.map((course, index) => (
                <div key={index} className="info-row">
                  <span className="info-label">Course {index + 1}:</span>
                  <span className="info-value">{course.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Payment Details */}
          <div className="section">
            <div className="section-title">Payment Details</div>
            <div className="info-row">
              <span className="info-label">Payment Type:</span>
              <span className="info-value">{getPaymentTypeText()}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Payment Method:</span>
              <span className="info-value">Online Payment (Cashfree)</span>
            </div>
            <div className="info-row">
              <span className="info-label">Status:</span>
              <span className="info-value" style={{ color: '#059669', fontWeight: 'bold' }}>
                ✓ PAID
              </span>
            </div>
          </div>

          {/* Amount Box */}
          <div className="amount-box">
            <div className="amount-label">Amount Paid</div>
            <div className="amount-value">₹{payment.amount.toLocaleString('en-IN')}</div>
          </div>

          {/* Footer */}
          <div className="footer">
            <p>This is a computer-generated receipt and does not require a signature.</p>
            <p>For any queries, please contact us at tarseducation.in</p>
            <p style={{ marginTop: '10px', fontWeight: 'bold' }}>Thank you for choosing TARS Education!</p>
          </div>

          {/* Stamp */}
          <div className="stamp">
            Generated on: {new Date().toLocaleString('en-IN')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentReceipt;
