import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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

interface ChartRefs {
  scoreCard?: HTMLElement | null;
  severityChart?: HTMLElement | null;
  trendChart?: HTMLElement | null;
  resolutionChart?: HTMLElement | null;
}

interface SecurityReportData {
  score: number;
  scoreChange: number;
  trendData: TrendDataItem[];
  severityData: SeverityDataItem[];
  resolutionData: ResolutionDataItem[];
  topVulnerabilities: VulnerabilityItem[];
  timeRange: string;
  chartRefs?: ChartRefs;
}

const captureChart = async (element: HTMLElement | null): Promise<string | null> => {
  if (!element) return null;
  
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: "#1a1a2e",
      scale: 2,
      logging: false,
      useCORS: true,
    });
    return canvas.toDataURL("image/png");
  } catch (error) {
    console.error("Error capturing chart:", error);
    return null;
  }
};

export const exportSecurityReportPDF = async (data: SecurityReportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Helper function for centered text
  const centerText = (text: string, y: number, fontSize: number = 12) => {
    doc.setFontSize(fontSize);
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, y);
  };

  // Helper to add new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
      return true;
    }
    return false;
  };

  // Capture all charts in parallel
  const [scoreCardImg, severityChartImg, trendChartImg, resolutionChartImg] = await Promise.all([
    captureChart(data.chartRefs?.scoreCard),
    captureChart(data.chartRefs?.severityChart),
    captureChart(data.chartRefs?.trendChart),
    captureChart(data.chartRefs?.resolutionChart),
  ]);

  // Header
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(26, 26, 46);
  doc.rect(0, 0, pageWidth, 45, "F");
  
  doc.setTextColor(255, 255, 255);
  centerText("DevGuard AI Security Report", yPos, 22);
  yPos += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(180, 180, 200);
  centerText(`Generated on ${new Date().toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "long", 
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })}`, yPos);
  yPos += 6;
  centerText(`Time Range: ${data.timeRange}`, yPos);
  yPos += 20;

  // Score and Severity Row
  doc.setTextColor(50, 50, 70);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Security Overview", 15, yPos);
  yPos += 8;

  if (scoreCardImg && severityChartImg) {
    // Add score card image
    const scoreWidth = 60;
    const scoreHeight = 45;
    doc.addImage(scoreCardImg, "PNG", 15, yPos, scoreWidth, scoreHeight);
    
    // Add severity chart image
    const severityWidth = 115;
    const severityHeight = 45;
    doc.addImage(severityChartImg, "PNG", 80, yPos, severityWidth, severityHeight);
    
    yPos += scoreHeight + 10;
  } else {
    // Fallback to text-based score
    const scoreColor = data.score >= 80 ? [34, 197, 94] : data.score >= 60 ? [234, 179, 8] : [239, 68, 68];
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.setFontSize(32);
    doc.setFont("helvetica", "bold");
    doc.text(`${data.score}`, 20, yPos + 10);
    
    doc.setTextColor(100);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const changeSymbol = data.scoreChange >= 0 ? "↑" : "↓";
    doc.text(`${changeSymbol} ${Math.abs(data.scoreChange)} points`, 50, yPos + 8);
    
    // Severity breakdown
    doc.setTextColor(50, 50, 70);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Severity Breakdown:", 100, yPos);
    yPos += 6;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const totalVulns = data.severityData.reduce((sum, item) => sum + item.value, 0);
    
    data.severityData.forEach((item, index) => {
      const percentage = ((item.value / totalVulns) * 100).toFixed(1);
      const color = item.name === "High" ? [239, 68, 68] : item.name === "Medium" ? [234, 179, 8] : [34, 197, 94];
      doc.setFillColor(color[0], color[1], color[2]);
      doc.circle(105, yPos + (index * 6) - 1, 2, "F");
      doc.setTextColor(50);
      doc.text(`${item.name}: ${item.value} (${percentage}%)`, 110, yPos + (index * 6));
    });
    yPos += 25;
  }

  // Vulnerability Trend Chart
  checkPageBreak(80);
  doc.setTextColor(50, 50, 70);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Vulnerability Trends Over Time", 15, yPos);
  yPos += 5;

  if (trendChartImg) {
    const chartWidth = pageWidth - 30;
    const chartHeight = 55;
    doc.addImage(trendChartImg, "PNG", 15, yPos, chartWidth, chartHeight);
    yPos += chartHeight + 10;
  } else {
    // Fallback table
    yPos += 5;
    doc.setFontSize(8);
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPos - 4, pageWidth - 30, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.text("Period", 20, yPos);
    doc.text("High", 60, yPos);
    doc.text("Medium", 90, yPos);
    doc.text("Low", 120, yPos);
    doc.text("Total", 150, yPos);
    yPos += 7;

    doc.setFont("helvetica", "normal");
    data.trendData.forEach((item, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(248, 248, 248);
        doc.rect(15, yPos - 3, pageWidth - 30, 5, "F");
      }
      doc.setTextColor(50);
      doc.text(item.date, 20, yPos);
      doc.setTextColor(239, 68, 68);
      doc.text(String(item.high), 60, yPos);
      doc.setTextColor(234, 179, 8);
      doc.text(String(item.medium), 90, yPos);
      doc.setTextColor(34, 197, 94);
      doc.text(String(item.low), 120, yPos);
      doc.setTextColor(50);
      doc.text(String(item.high + item.medium + item.low), 150, yPos);
      yPos += 5;
    });
    yPos += 10;
  }

  // Resolution Rate Chart
  checkPageBreak(70);
  doc.setTextColor(50, 50, 70);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Resolution Rate", 15, yPos);
  yPos += 5;

  if (resolutionChartImg) {
    const chartWidth = (pageWidth - 30) / 2;
    const chartHeight = 50;
    doc.addImage(resolutionChartImg, "PNG", 15, yPos, chartWidth, chartHeight);
    
    // Add summary stats next to the chart
    const statsX = chartWidth + 25;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    const totalFound = data.resolutionData.reduce((sum, item) => sum + item.found, 0);
    const totalResolved = data.resolutionData.reduce((sum, item) => sum + item.resolved, 0);
    const resolutionRate = ((totalResolved / totalFound) * 100).toFixed(1);
    
    doc.setTextColor(100);
    doc.text("Summary Statistics:", statsX, yPos + 10);
    yPos += 15;
    
    doc.setTextColor(50);
    doc.text(`Total Found: ${totalFound}`, statsX, yPos);
    doc.text(`Total Resolved: ${totalResolved}`, statsX, yPos + 8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(34, 197, 94);
    doc.text(`Resolution Rate: ${resolutionRate}%`, statsX, yPos + 16);
    
    yPos += chartHeight + 5;
  } else {
    yPos += 5;
    const totalFound = data.resolutionData.reduce((sum, item) => sum + item.found, 0);
    const totalResolved = data.resolutionData.reduce((sum, item) => sum + item.resolved, 0);
    const resolutionRate = ((totalResolved / totalFound) * 100).toFixed(1);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.text(`Total Found: ${totalFound} | Total Resolved: ${totalResolved} | Rate: ${resolutionRate}%`, 20, yPos);
    yPos += 15;
  }

  // Top Vulnerabilities Table
  checkPageBreak(60);
  doc.setTextColor(50, 50, 70);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Top Vulnerability Types", 15, yPos);
  yPos += 8;

  doc.setFontSize(9);
  doc.setFillColor(50, 50, 70);
  doc.rect(15, yPos - 4, pageWidth - 30, 8, "F");
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.text("#", 20, yPos);
  doc.text("Vulnerability Type", 30, yPos);
  doc.text("Severity", 120, yPos);
  doc.text("Count", 165, yPos);
  yPos += 8;

  doc.setFont("helvetica", "normal");
  data.topVulnerabilities.forEach((vuln, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(245, 245, 250);
      doc.rect(15, yPos - 4, pageWidth - 30, 7, "F");
    }
    doc.setTextColor(50);
    doc.text(String(index + 1), 20, yPos);
    doc.text(vuln.type, 30, yPos);
    
    const sevColor = vuln.severity === "high" ? [239, 68, 68] : vuln.severity === "medium" ? [234, 179, 8] : [34, 197, 94];
    doc.setFillColor(sevColor[0], sevColor[1], sevColor[2]);
    doc.roundedRect(118, yPos - 3.5, 30, 5, 1, 1, "F");
    doc.setTextColor(255);
    doc.setFontSize(7);
    doc.text(vuln.severity.toUpperCase(), 125, yPos - 0.5);
    doc.setFontSize(9);
    
    doc.setTextColor(50);
    doc.text(String(vuln.count), 168, yPos);
    yPos += 7;
  });

  // Footer
  const footerY = pageHeight - 15;
  doc.setDrawColor(200);
  doc.line(15, footerY - 5, pageWidth - 15, footerY - 5);
  doc.setFontSize(8);
  doc.setTextColor(150);
  centerText("Generated by DevGuard AI - Automated Security Scanning", footerY);

  // Save the PDF
  const fileName = `security-report-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
};
