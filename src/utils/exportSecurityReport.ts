import jsPDF from "jspdf";

interface TrendDataItem {
  date: string;
  high: number;
  medium: number;
  low: number;
}

interface SeverityDataItem {
  name: string;
  value: number;
}

interface ResolutionDataItem {
  week: string;
  found: number;
  resolved: number;
}

interface VulnerabilityItem {
  type: string;
  count: number;
  severity: "high" | "medium" | "low";
}

interface SecurityReportData {
  score: number;
  scoreChange: number;
  trendData: TrendDataItem[];
  severityData: SeverityDataItem[];
  resolutionData: ResolutionDataItem[];
  topVulnerabilities: VulnerabilityItem[];
  timeRange: string;
}

export const exportSecurityReportPDF = (data: SecurityReportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Helper function for centered text
  const centerText = (text: string, y: number, fontSize: number = 12) => {
    doc.setFontSize(fontSize);
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, y);
  };

  // Header
  doc.setFont("helvetica", "bold");
  centerText("DevGuard AI Security Report", yPos, 20);
  yPos += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100);
  centerText(`Generated on ${new Date().toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "long", 
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })}`, yPos);
  yPos += 5;
  centerText(`Time Range: ${data.timeRange}`, yPos);
  yPos += 15;

  // Divider
  doc.setDrawColor(200);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 15;

  // Security Score Section
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Security Score Overview", 20, yPos);
  yPos += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  
  const scoreColor = data.score >= 80 ? [34, 197, 94] : data.score >= 60 ? [234, 179, 8] : [239, 68, 68];
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text(`${data.score}`, 20, yPos + 5);
  
  doc.setTextColor(100);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const changeSymbol = data.scoreChange >= 0 ? "↑" : "↓";
  const changeText = `${changeSymbol} ${Math.abs(data.scoreChange)} points from last period`;
  doc.text(changeText, 45, yPos + 2);
  yPos += 20;

  // Severity Breakdown
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Severity Breakdown", 20, yPos);
  yPos += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  
  const totalVulns = data.severityData.reduce((sum, item) => sum + item.value, 0);
  
  data.severityData.forEach((item) => {
    const percentage = ((item.value / totalVulns) * 100).toFixed(1);
    const color = item.name === "High" ? [239, 68, 68] : item.name === "Medium" ? [234, 179, 8] : [34, 197, 94];
    
    // Draw color indicator
    doc.setFillColor(color[0], color[1], color[2]);
    doc.circle(25, yPos - 2, 2, "F");
    
    doc.setTextColor(0);
    doc.text(`${item.name}: ${item.value} (${percentage}%)`, 30, yPos);
    yPos += 6;
  });
  yPos += 10;

  // Vulnerability Trends Summary
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Vulnerability Trends", 20, yPos);
  yPos += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  
  // Table header
  doc.setFillColor(240, 240, 240);
  doc.rect(20, yPos - 4, pageWidth - 40, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.text("Period", 25, yPos);
  doc.text("High", 70, yPos);
  doc.text("Medium", 100, yPos);
  doc.text("Low", 140, yPos);
  doc.text("Total", 170, yPos);
  yPos += 8;

  doc.setFont("helvetica", "normal");
  data.trendData.forEach((item, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(248, 248, 248);
      doc.rect(20, yPos - 4, pageWidth - 40, 6, "F");
    }
    doc.setTextColor(0);
    doc.text(item.date, 25, yPos);
    doc.setTextColor(239, 68, 68);
    doc.text(String(item.high), 70, yPos);
    doc.setTextColor(234, 179, 8);
    doc.text(String(item.medium), 100, yPos);
    doc.setTextColor(34, 197, 94);
    doc.text(String(item.low), 140, yPos);
    doc.setTextColor(0);
    doc.text(String(item.high + item.medium + item.low), 170, yPos);
    yPos += 6;
  });
  yPos += 10;

  // Resolution Rate
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Resolution Rate", 20, yPos);
  yPos += 8;

  const totalFound = data.resolutionData.reduce((sum, item) => sum + item.found, 0);
  const totalResolved = data.resolutionData.reduce((sum, item) => sum + item.resolved, 0);
  const resolutionRate = ((totalResolved / totalFound) * 100).toFixed(1);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Total Found: ${totalFound}`, 25, yPos);
  yPos += 6;
  doc.text(`Total Resolved: ${totalResolved}`, 25, yPos);
  yPos += 6;
  doc.setFont("helvetica", "bold");
  doc.text(`Resolution Rate: ${resolutionRate}%`, 25, yPos);
  yPos += 15;

  // Top Vulnerabilities
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Top Vulnerability Types", 20, yPos);
  yPos += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  // Table header
  doc.setFillColor(240, 240, 240);
  doc.rect(20, yPos - 4, pageWidth - 40, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.text("#", 25, yPos);
  doc.text("Vulnerability Type", 35, yPos);
  doc.text("Severity", 120, yPos);
  doc.text("Count", 160, yPos);
  yPos += 8;

  doc.setFont("helvetica", "normal");
  data.topVulnerabilities.forEach((vuln, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(248, 248, 248);
      doc.rect(20, yPos - 4, pageWidth - 40, 6, "F");
    }
    doc.setTextColor(0);
    doc.text(String(index + 1), 25, yPos);
    doc.text(vuln.type, 35, yPos);
    
    const sevColor = vuln.severity === "high" ? [239, 68, 68] : vuln.severity === "medium" ? [234, 179, 8] : [34, 197, 94];
    doc.setTextColor(sevColor[0], sevColor[1], sevColor[2]);
    doc.text(vuln.severity.toUpperCase(), 120, yPos);
    
    doc.setTextColor(0);
    doc.text(String(vuln.count), 160, yPos);
    yPos += 6;
  });

  // Footer
  yPos = doc.internal.pageSize.getHeight() - 20;
  doc.setDrawColor(200);
  doc.line(20, yPos - 5, pageWidth - 20, yPos - 5);
  doc.setFontSize(8);
  doc.setTextColor(150);
  centerText("Generated by DevGuard AI - Automated Security Scanning", yPos);

  // Save the PDF
  const fileName = `security-report-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
};
