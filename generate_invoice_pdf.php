
<!-- Group 4 
Greeshma Prasad - 9042892 
Arya Reghu - 8960917 
Sitong Liu 8990939  
Dharanya Selvaraj - 8998287 -->
<?php
require('fpdf/fpdf.php');
require('config.php');

$invoiceId = $_GET['id'];

// Get invoice
$invoice = $pdo->query("SELECT * FROM invoices WHERE invoice_id = $invoiceId")->fetch();
$customer = $pdo->query("SELECT * FROM customers WHERE customer_id = {$invoice['customer_id']}")->fetch();
$items = $pdo->query("
  SELECT ii.*, b.title 
  FROM invoice_items ii
  JOIN books b ON ii.book_id = b.book_id
  WHERE invoice_id = $invoiceId
")->fetchAll();

class PDF extends FPDF {
  function Header() {
    // Logo
    $this->Image('logo.jpg', 10, 10, 30); // Adjust path/size as needed

    // Smartcheck Info
    $this->SetFont('Arial','B',16);
    $this->Cell(0,10,'Smartcheck',0,1,'R');

    $this->SetFont('Arial','',12);
    $this->Cell(0,10,'123 Your Street, City, ZIP, Country',0,1,'R');
    $this->Cell(0,10,'Email: support@smartcheck.com',0,1,'R');
    $this->Cell(0,10,'Phone: +1-123-456-7890',0,1,'R');
    $this->Ln(20);
  }

  function Footer() {
    $this->SetY(-30);
    $this->SetFont('Arial','I',10);
    $this->Cell(0,10,'Thank you for choosing Smartcheck!',0,1,'C');
    $this->SetFont('Arial','',8);
    $this->Cell(0,10,'Generated using Smartcheck Bookstore System',0,0,'C');
  }
}

$pdf = new PDF();
$pdf->AddPage();
$pdf->SetFont('Arial','B',14);
$pdf->Cell(100,10,"Invoice #{$invoice['invoice_id']}");
$pdf->SetFont('Arial','',12);
$pdf->Cell(0,10,"Date of Issue: {$invoice['date_issued']}",0,1,'R');

$pdf->SetFont('Arial','B',12);
$pdf->Cell(0,10,'Billed To:',0,1);
$pdf->SetFont('Arial','',12);
$pdf->Cell(0,6,"{$customer['first_name']} {$customer['last_name']}",0,1);
$pdf->Cell(0,6,"{$customer['address']}, {$customer['city']}, {$customer['postal_code']}",0,1);
$pdf->Ln(10);

// Table Header
$pdf->SetFillColor(230,230,230);
$pdf->SetFont('Arial','B',12);
$pdf->Cell(80,10,'Description',1,0,'L',true);
$pdf->Cell(30,10,'Unit Cost',1,0,'C',true);
$pdf->Cell(20,10,'Qty',1,0,'C',true);
$pdf->Cell(30,10,'Amount',1,1,'C',true);

// Table Rows
$pdf->SetFont('Arial','',12);
foreach($items as $item) {
  $pdf->Cell(80,10,$item['title'],1);
  $pdf->Cell(30,10,'$'.$item['unit_cost'],1,0,'C');
  $pdf->Cell(20,10,$item['quantity'],1,0,'C');
  $pdf->Cell(30,10,'$'.$item['amount'],1,1,'C');
}

$pdf->Ln(10);

// Summary
$pdf->Cell(130);
$pdf->Cell(30,8,'Subtotal:',0,0,'R');
$pdf->Cell(30,8,'$'.$invoice['subtotal'],0,1,'R');

$pdf->Cell(130);
$pdf->Cell(30,8,'Discount:',0,0,'R');
$pdf->Cell(30,8,$invoice['discount'].'%',0,1,'R');

$pdf->Cell(130);
$pdf->Cell(30,8,'Tax ('.$invoice['tax_rate'].'%):',0,0,'R');
$pdf->Cell(30,8,'$'.$invoice['tax_amount'],0,1,'R');

$pdf->Cell(130);
$pdf->SetFont('Arial','B',12);
$pdf->Cell(30,10,'Total:',0,0,'R');
$pdf->Cell(30,10,'$'.$invoice['total'],0,1,'R');

$pdf->Ln(10);
$pdf->SetFont('Arial','',10);
$pdf->MultiCell(0,6,'Terms: '.$invoice['terms']);

$pdf->Output("D", "Invoice_{$invoiceId}.pdf");