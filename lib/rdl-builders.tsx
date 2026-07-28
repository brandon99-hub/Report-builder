export function buildItemTableXml(itemColumns: any[]): string {
  if (!Array.isArray(itemColumns) || itemColumns.length === 0) {
    throw new Error("Item columns array cannot be empty")
  }

  const colCount = itemColumns.length
  // Fixed column width - use layout engine specification (189mm total width)
  const availableWidth = 189
  const colWidth = availableWidth / colCount

  const headerCells = itemColumns
    .map((col) => {
      const fieldName = col.fieldName.replace(/[^a-zA-Z0-9_]/g, "_")
      return `<TablixCell>
        <CellContents>
          <Textbox Name="Header_${fieldName}">
            <CanGrow>false</CanGrow>
            <CanShrink>false</CanShrink>
            <KeepTogether>true</KeepTogether>
            <Paragraphs>
              <Paragraph>
                <TextRuns>
                  <TextRun>
                    <Value>${escapeXmlValue(col.label)}</Value>
                    <Style>
                      <FontWeight>Bold</FontWeight>
                      <FontSize>11pt</FontSize>
                      <Color>#FFFFFF</Color>
                    </Style>
                  </TextRun>
                </TextRuns>
              </Paragraph>
            </Paragraphs>
            <Style>
              <FontWeight>Bold</FontWeight>
              <FontSize>11pt</FontSize>
              <Color>#FFFFFF</Color>
              <TopBorder>
                <Style>Solid</Style>
                <Width>1pt</Width>
                <Color>#1e293b</Color>
              </TopBorder>
              <BottomBorder>
                <Style>Solid</Style>
                <Width>1pt</Width>
                <Color>#1e293b</Color>
              </BottomBorder>
              <LeftBorder>
                <Style>Solid</Style>
                <Width>1pt</Width>
                <Color>#1e293b</Color>
              </LeftBorder>
              <RightBorder>
                <Style>Solid</Style>
                <Width>1pt</Width>
                <Color>#1e293b</Color>
              </RightBorder>
              <BackgroundColor>#1e293b</BackgroundColor>
              <PaddingLeft>2pt</PaddingLeft>
              <PaddingRight>2pt</PaddingRight>
              <PaddingTop>2pt</PaddingTop>
              <PaddingBottom>2pt</PaddingBottom>
              <TextAlign>${getTextAlignment(col.dataType)}</TextAlign>
            </Style>
          </Textbox>
        </CellContents>
      </TablixCell>`
    })
    .join("\n")

  const dataCells = itemColumns
    .map((col, idx) => {
      const fieldName = col.fieldName.replace(/[^a-zA-Z0-9_]/g, "_")
      const expression = buildFieldExpression(col)
      // Alternate row background colors for better readability
      return `<TablixCell>
        <CellContents>
          <Textbox Name="Data_${fieldName}">
            <CanGrow>false</CanGrow>
            <CanShrink>false</CanShrink>
            <KeepTogether>true</KeepTogether>
            <Paragraphs>
              <Paragraph>
                <TextRuns>
                  <TextRun>
                    <Value>${expression}</Value>
                    <Style>
                      <Color>#1f2937</Color>
                      <FontSize>10pt</FontSize>
                      <Format>${getFormat(col.dataType, col.format)}</Format>
                    </Style>
                  </TextRun>
                </TextRuns>
              </Paragraph>
            </Paragraphs>
            <Style>
              <TopBorder>
                <Style>Solid</Style>
                <Width>1pt</Width>
                <Color>#e5e7eb</Color>
              </TopBorder>
              <BottomBorder>
                <Style>Solid</Style>
                <Width>1pt</Width>
                <Color>#e5e7eb</Color>
              </BottomBorder>
              <LeftBorder>
                <Style>Solid</Style>
                <Width>1pt</Width>
                <Color>#e5e7eb</Color>
              </LeftBorder>
              <RightBorder>
                <Style>Solid</Style>
                <Width>1pt</Width>
                <Color>#e5e7eb</Color>
              </RightBorder>
              <BackgroundColor>#ffffff</BackgroundColor>
              <PaddingLeft>2pt</PaddingLeft>
              <PaddingRight>2pt</PaddingRight>
              <PaddingTop>2pt</PaddingTop>
              <PaddingBottom>2pt</PaddingBottom>
              <TextAlign>${getTextAlignment(col.dataType)}</TextAlign>
              <Format>${getFormat(col.dataType, col.format)}</Format>
              <Color>#1f2937</Color>
              <FontSize>10pt</FontSize>
            </Style>
          </Textbox>
        </CellContents>
      </TablixCell>`
    })
    .join("\n")

  const columnDefs = itemColumns
    .map(
      () => `<TablixColumn>
      <Width>${colWidth.toFixed(2)}mm</Width>
    </TablixColumn>`,
    )
    .join("\n")
  
  const columnMembers = itemColumns
    .map(() => `<TablixMember />`)
    .join("\n        ")

  return `<Tablix Name="ItemsTable">
    <TablixBody>
      <TablixColumns>
        ${columnDefs}
      </TablixColumns>
      <TablixRows>
        <TablixRow>
          <Height>12mm</Height>
          <TablixCells>
            ${headerCells}
          </TablixCells>
        </TablixRow>
        <TablixRow>
          <Height>10mm</Height>
          <TablixCells>
            ${dataCells}
          </TablixCells>
        </TablixRow>
      </TablixRows>
    </TablixBody>
    <TablixRowHierarchy>
      <TablixMembers>
        <TablixMember>
          <KeepWithGroup>After</KeepWithGroup>
        </TablixMember>
        <TablixMember>
          <Group Name="Details" />
          <TablixMembers>
            <TablixMember />
          </TablixMembers>
        </TablixMember>
      </TablixMembers>
    </TablixRowHierarchy>
    <TablixColumnHierarchy>
      <TablixMembers>
        ${columnMembers}
      </TablixMembers>
    </TablixColumnHierarchy>
    <Top>115mm</Top>
    <Left>10.58mm</Left>
    <Width>189mm</Width>
    <Height>60mm</Height>
    <ZIndex>1</ZIndex>
  </Tablix>`
}

// Build Ship To section XML
export function buildShipToSection(schema: any): string {
  if (!schema.shipToEnabled || !schema.shippingAddress) {
    return ""
  }
  
  const shippingAddressFormatted = (schema.shippingAddress || "").replace(/\n/g, "&#x0A;")
  const deliveryContact = escapeXmlValue(schema.deliveryContact || "")
  const deliveryDate = schema.deliveryDate 
    ? new Date(schema.deliveryDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : ""
  
  return `<Rectangle Name="ShipToBox">
    <ReportItems>
      <Textbox Name="ShipToLabel">
        <Paragraphs>
          <Paragraph>
            <TextRuns>
              <TextRun>
                <Value>SHIP TO</Value>
                <Style>
                  <FontSize>11pt</FontSize>
                  <FontWeight>Bold</FontWeight>
                  <Color>#6b7280</Color>
                </Style>
              </TextRun>
            </TextRuns>
          </Paragraph>
        </Paragraphs>
        <Style>
          <FontSize>11pt</FontSize>
          <FontWeight>Bold</FontWeight>
          <Color>#6b7280</Color>
        </Style>
        <Top>5.29mm</Top>
        <Left>5.29mm</Left>
        <Width>80mm</Width>
        <Height>5mm</Height>
        <CanGrow>false</CanGrow>
        <CanShrink>false</CanShrink>
      </Textbox>
      <Textbox Name="ShipToAddress">
        <Paragraphs>
          <Paragraph>
            <TextRuns>
              <TextRun>
                <Value>${escapeXmlValue(shippingAddressFormatted)}</Value>
                <Style>
                  <FontSize>15pt</FontSize>
                  <Color>#1f2937</Color>
                </Style>
              </TextRun>
            </TextRuns>
          </Paragraph>
        </Paragraphs>
        <Style>
          <FontSize>15pt</FontSize>
          <Color>#1f2937</Color>
        </Style>
        <Top>12mm</Top>
        <Left>5.29mm</Left>
        <Width>80mm</Width>
        <Height>12mm</Height>
        <CanGrow>false</CanGrow>
        <CanShrink>false</CanShrink>
      </Textbox>
      ${deliveryContact ? `<Textbox Name="ShipToContact">
        <Paragraphs>
          <Paragraph>
            <TextRuns>
              <TextRun>
                <Value>Contact: ${deliveryContact}</Value>
                <Style>
                  <FontSize>12pt</FontSize>
                  <Color>#1f2937</Color>
                </Style>
              </TextRun>
            </TextRuns>
          </Paragraph>
        </Paragraphs>
        <Style>
          <FontSize>12pt</FontSize>
          <Color>#1f2937</Color>
        </Style>
        <Top>24mm</Top>
        <Left>5.29mm</Left>
        <Width>80mm</Width>
        <Height>6mm</Height>
        <CanGrow>false</CanGrow>
        <CanShrink>false</CanShrink>
      </Textbox>` : ""}
      ${deliveryDate ? `<Textbox Name="ShipToDate">
        <Paragraphs>
          <Paragraph>
            <TextRuns>
              <TextRun>
                <Value>Delivery Date: ${escapeXmlValue(deliveryDate)}</Value>
                <Style>
                  <FontSize>12pt</FontSize>
                  <Color>#1f2937</Color>
                </Style>
              </TextRun>
            </TextRuns>
          </Paragraph>
        </Paragraphs>
        <Style>
          <FontSize>12pt</FontSize>
          <Color>#1f2937</Color>
        </Style>
        <Top>30mm</Top>
        <Left>5.29mm</Left>
        <Width>80mm</Width>
        <Height>6mm</Height>
        <CanGrow>false</CanGrow>
        <CanShrink>false</CanShrink>
      </Textbox>` : ""}
    </ReportItems>
    <Style>
      <BackgroundColor>#f9fafb</BackgroundColor>
      <LeftBorder>
        <Style>Solid</Style>
        <Width>1.06mm</Width>
        <Color>#3b82f6</Color>
      </LeftBorder>
    </Style>
    <Top>110mm</Top>
    <Left>115mm</Left>
    <Width>85mm</Width>
    <Height>40mm</Height>
  </Rectangle>`
}

// Build Payment section XML
export function buildPaymentSection(schema: any): string {
  if (!schema.paymentEnabled) {
    return ""
  }
  
  const paymentInstructions = escapeXmlValue(schema.paymentInstructions || "")
  const bankName = escapeXmlValue(schema.bankName || "")
  const accountNumber = escapeXmlValue(schema.accountNumber || "")
  const swiftCode = escapeXmlValue(schema.swiftCode || "")
  const mpesaPaybill = escapeXmlValue(schema.mpesaPaybill || "")
  const paymentLink = escapeXmlValue(schema.paymentLink || "")
  const paymentTerms = escapeXmlValue(schema.paymentTerms || "")
  
  let paymentContent = ""
  if (paymentInstructions) {
    paymentContent += `<Textbox Name="PaymentInstructions">
      <Paragraphs>
        <Paragraph>
          <TextRuns>
            <TextRun>
              <Value>${paymentInstructions}</Value>
              <Style>
                <FontSize>12pt</FontSize>
                <Color>#1f2937</Color>
              </Style>
            </TextRun>
          </TextRuns>
        </Paragraph>
      </Paragraphs>
      <Style>
        <FontSize>12pt</FontSize>
        <Color>#1f2937</Color>
      </Style>
      <Top>5.29mm</Top>
      <Left>5.29mm</Left>
      <Width>180mm</Width>
      <Height>8mm</Height>
      <CanGrow>false</CanGrow>
      <CanShrink>false</CanShrink>
    </Textbox>`
  }
  
  let currentTop = 15
  if (bankName) {
    paymentContent += `<Textbox Name="BankName">
      <Paragraphs>
        <Paragraph>
          <TextRuns>
            <TextRun>
              <Value>Bank: ${bankName}</Value>
              <Style>
                <FontSize>11pt</FontSize>
                <Color>#1f2937</Color>
              </Style>
            </TextRun>
          </TextRuns>
        </Paragraph>
      </Paragraphs>
      <Style>
        <FontSize>11pt</FontSize>
        <Color>#1f2937</Color>
      </Style>
      <Top>${currentTop}mm</Top>
      <Left>5.29mm</Left>
      <Width>180mm</Width>
      <Height>6mm</Height>
      <CanGrow>false</CanGrow>
      <CanShrink>false</CanShrink>
    </Textbox>`
    currentTop += 8
  }
  
  if (accountNumber) {
    paymentContent += `<Textbox Name="AccountNumber">
      <Paragraphs>
        <Paragraph>
          <TextRuns>
            <TextRun>
              <Value>Account: ${accountNumber}</Value>
              <Style>
                <FontSize>11pt</FontSize>
                <Color>#1f2937</Color>
              </Style>
            </TextRun>
          </TextRuns>
        </Paragraph>
      </Paragraphs>
      <Style>
        <FontSize>11pt</FontSize>
        <Color>#1f2937</Color>
      </Style>
      <Top>${currentTop}mm</Top>
      <Left>5.29mm</Left>
      <Width>180mm</Width>
      <Height>6mm</Height>
      <CanGrow>false</CanGrow>
      <CanShrink>false</CanShrink>
    </Textbox>`
    currentTop += 8
  }
  
  if (swiftCode) {
    paymentContent += `<Textbox Name="SwiftCode">
      <Paragraphs>
        <Paragraph>
          <TextRuns>
            <TextRun>
              <Value>SWIFT: ${swiftCode}</Value>
              <Style>
                <FontSize>11pt</FontSize>
                <Color>#1f2937</Color>
              </Style>
            </TextRun>
          </TextRuns>
        </Paragraph>
      </Paragraphs>
      <Style>
        <FontSize>11pt</FontSize>
        <Color>#1f2937</Color>
      </Style>
      <Top>${currentTop}mm</Top>
      <Left>5.29mm</Left>
      <Width>180mm</Width>
      <Height>6mm</Height>
      <CanGrow>false</CanGrow>
      <CanShrink>false</CanShrink>
    </Textbox>`
    currentTop += 8
  }
  
  if (mpesaPaybill) {
    paymentContent += `<Textbox Name="MpesaPaybill">
      <Paragraphs>
        <Paragraph>
          <TextRuns>
            <TextRun>
              <Value>M-PESA: ${mpesaPaybill}</Value>
              <Style>
                <FontSize>11pt</FontSize>
                <Color>#1f2937</Color>
              </Style>
            </TextRun>
          </TextRuns>
        </Paragraph>
      </Paragraphs>
      <Style>
        <FontSize>11pt</FontSize>
        <Color>#1f2937</Color>
      </Style>
      <Top>${currentTop}mm</Top>
      <Left>5.29mm</Left>
      <Width>180mm</Width>
      <Height>6mm</Height>
      <CanGrow>false</CanGrow>
      <CanShrink>false</CanShrink>
    </Textbox>`
    currentTop += 8
  }
  
  if (paymentLink) {
    paymentContent += `<Textbox Name="PaymentLink">
      <Paragraphs>
        <Paragraph>
          <TextRuns>
            <TextRun>
              <Value>Pay Online: ${paymentLink}</Value>
              <Style>
                <FontSize>11pt</FontSize>
                <Color>#3b82f6</Color>
              </Style>
            </TextRun>
          </TextRuns>
        </Paragraph>
      </Paragraphs>
      <Style>
        <FontSize>11pt</FontSize>
        <Color>#3b82f6</Color>
      </Style>
      <Top>${currentTop}mm</Top>
      <Left>5.29mm</Left>
      <Width>180mm</Width>
      <Height>6mm</Height>
      <CanGrow>false</CanGrow>
      <CanShrink>false</CanShrink>
    </Textbox>`
    currentTop += 8
  }
  
  if (paymentTerms) {
    paymentContent += `<Textbox Name="PaymentTerms">
      <Paragraphs>
        <Paragraph>
          <TextRuns>
            <TextRun>
              <Value>Terms: ${paymentTerms}</Value>
              <Style>
                <FontSize>11pt</FontSize>
                <Color>#6b7280</Color>
              </Style>
            </TextRun>
          </TextRuns>
        </Paragraph>
      </Paragraphs>
      <Style>
        <FontSize>11pt</FontSize>
        <Color>#6b7280</Color>
      </Style>
      <Top>${currentTop}mm</Top>
      <Left>5.29mm</Left>
      <Width>180mm</Width>
      <Height>6mm</Height>
      <CanGrow>false</CanGrow>
      <CanShrink>false</CanShrink>
    </Textbox>`
  }
  
  return `<Rectangle Name="PaymentBox">
    <ReportItems>
      <Textbox Name="PaymentLabel">
        <Paragraphs>
          <Paragraph>
            <TextRuns>
              <TextRun>
                <Value>PAYMENT INFORMATION</Value>
                <Style>
                  <FontSize>11pt</FontSize>
                  <FontWeight>Bold</FontWeight>
                  <Color>#6b7280</Color>
                </Style>
              </TextRun>
            </TextRuns>
          </Paragraph>
        </Paragraphs>
        <Style>
          <FontSize>11pt</FontSize>
          <FontWeight>Bold</FontWeight>
          <Color>#6b7280</Color>
        </Style>
        <Top>2mm</Top>
        <Left>5.29mm</Left>
        <Width>180mm</Width>
        <Height>5mm</Height>
        <CanGrow>false</CanGrow>
        <CanShrink>false</CanShrink>
      </Textbox>
      ${paymentContent}
    </ReportItems>
    <Style>
      <BackgroundColor>#f9fafb</BackgroundColor>
      <LeftBorder>
        <Style>Solid</Style>
        <Width>1.06mm</Width>
        <Color>#3b82f6</Color>
      </LeftBorder>
    </Style>
    <Top>220mm</Top>
    <Left>10.58mm</Left>
    <Width>189mm</Width>
    <Height>${currentTop + 10}mm</Height>
  </Rectangle>`
}

// Build Footer section XML
export function buildFooterSection(schema: any, bcMode: boolean = false): string {
  if (!schema.footerEnabled) {
    return ""
  }
  
  const thankYouMessage = escapeXmlValue(schema.thankYouMessage || "Thank you for your business!")
  const notes = escapeXmlValue(schema.notes || "")
  const legalTerms = escapeXmlValue(schema.legalTerms || "")
  const returnPolicy = escapeXmlValue(schema.returnPolicy || "")
  
  let footerContent = `<Textbox Name="ThankYouMessage">
    <Paragraphs>
      <Paragraph>
        <TextRuns>
            <TextRun>
              <Value>${thankYouMessage}</Value>
              <Style>
                <FontFamily>Segoe UI</FontFamily>
                <FontSize>11pt</FontSize>
                <FontWeight>Bold</FontWeight>
                <Color>#6b7280</Color>
              </Style>
            </TextRun>
        </TextRuns>
      </Paragraph>
    </Paragraphs>
    <Style>
      <FontFamily>Segoe UI</FontFamily>
      <FontSize>11pt</FontSize>
      <FontWeight>Bold</FontWeight>
      <Color>#6b7280</Color>
      <TextAlign>Center</TextAlign>
    </Style>
    <Top>5mm</Top>
    <Left>0mm</Left>
    <Width>210mm</Width>
    <Height>8mm</Height>
    <CanGrow>false</CanGrow>
    <CanShrink>false</CanShrink>
  </Textbox>`
  
  let currentTop = 15
  if (notes) {
    footerContent += `<Textbox Name="FooterNotes">
      <Paragraphs>
        <Paragraph>
          <TextRuns>
            <TextRun>
              <Value>${notes}</Value>
              <Style>
                <FontFamily>Segoe UI</FontFamily>
                <FontSize>9pt</FontSize>
                <Color>#6b7280</Color>
              </Style>
            </TextRun>
          </TextRuns>
        </Paragraph>
      </Paragraphs>
      <Style>
        <FontFamily>Segoe UI</FontFamily>
        <FontSize>9pt</FontSize>
        <Color>#6b7280</Color>
      </Style>
      <Top>${currentTop}mm</Top>
      <Left>10.58mm</Left>
      <Width>189mm</Width>
      <Height>8mm</Height>
      <CanGrow>false</CanGrow>
      <CanShrink>false</CanShrink>
    </Textbox>`
    currentTop += 10
  }
  
  if (legalTerms) {
    footerContent += `<Textbox Name="LegalTerms">
      <Paragraphs>
        <Paragraph>
          <TextRuns>
            <TextRun>
              <Value>${legalTerms}</Value>
              <Style>
                <FontFamily>Segoe UI</FontFamily>
                <FontSize>8pt</FontSize>
                <Color>#9ca3af</Color>
              </Style>
            </TextRun>
          </TextRuns>
        </Paragraph>
      </Paragraphs>
      <Style>
        <FontFamily>Segoe UI</FontFamily>
        <FontSize>8pt</FontSize>
        <Color>#9ca3af</Color>
      </Style>
      <Top>${currentTop}mm</Top>
      <Left>10.58mm</Left>
      <Width>189mm</Width>
      <Height>8mm</Height>
      <CanGrow>false</CanGrow>
      <CanShrink>false</CanShrink>
    </Textbox>`
    currentTop += 10
  }
  
  if (returnPolicy) {
    footerContent += `<Textbox Name="ReturnPolicy">
      <Paragraphs>
        <Paragraph>
          <TextRuns>
            <TextRun>
              <Value>${returnPolicy}</Value>
              <Style>
                <FontFamily>Segoe UI</FontFamily>
                <FontSize>8pt</FontSize>
                <Color>#9ca3af</Color>
              </Style>
            </TextRun>
          </TextRuns>
        </Paragraph>
      </Paragraphs>
      <Style>
        <FontFamily>Segoe UI</FontFamily>
        <FontSize>8pt</FontSize>
        <Color>#9ca3af</Color>
      </Style>
      <Top>${currentTop}mm</Top>
      <Left>10.58mm</Left>
      <Width>189mm</Width>
      <Height>8mm</Height>
      <CanGrow>false</CanGrow>
      <CanShrink>false</CanShrink>
    </Textbox>`
    currentTop += 10
  }

  // Calculate footer position
  const pageHeight = 297 // A4 height in mm
  const footerHeight = currentTop + 10
  let footerTop: number

  if (bcMode) {
    // BC mode: Use fixed safe position since BC owns the data and we can't reliably count rows
    // Position footer at a safe spot near bottom of page (230mm leaves ~50mm for content above)
    footerTop = 230
    // Ensure it doesn't go off-page
    const maxTop = pageHeight - (footerHeight + 15) // at least 15mm bottom margin
    if (footerTop > maxTop) footerTop = maxTop
  } else {
    // Preview mode: Calculate dynamically based on table + totals height
    // Table now starts at 120mm (matching buildItemTableForBC)
    const tableStart = 120
    const headerHeight = 12
    const rowHeight = 10
    const spacing = 10
    const invoiceItems = schema.invoiceItems || []
    const totals = schema.totals || []

    const numRows = invoiceItems.length > 0 ? invoiceItems.length : 1
    const totalTop = tableStart + headerHeight + (numRows * rowHeight) + spacing

    // Approximate the bottom of the totals block
    let lastTotalsBottom = totalTop
    if (totals.length > 0) {
      const lastTop = totalTop + (totals.length - 1) * 7
      const lastHeight = totals.length > 0 ? 8 : 6
      lastTotalsBottom = lastTop + lastHeight
    }

    // 15mm spacing after totals/payment before footer
    footerTop = lastTotalsBottom + 15

    // Keep footer within a pleasant band near the bottom of the page
    const minTop = 200 // don't let footer float too high
    const maxTop = pageHeight - (footerHeight + 15) // at least 15mm bottom margin
    if (footerTop < minTop) footerTop = minTop
    if (footerTop > maxTop) footerTop = maxTop
  }
  
  return `<Rectangle Name="FooterBox">
    <ReportItems>
      ${footerContent}
    </ReportItems>
    <Style>
      <BackgroundColor>#f9fafb</BackgroundColor>
      <TopBorder>
        <Style>Solid</Style>
        <Width>1pt</Width>
        <Color>#e5e7eb</Color>
      </TopBorder>
    </Style>
    <Top>${footerTop}mm</Top>
    <Left>0mm</Left>
    <Width>210mm</Width>
    <Height>${currentTop + 10}mm</Height>
  </Rectangle>`
}

function escapeXmlValue(str: string): string {
  if (typeof str !== "string") return ""
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export function buildTotalsXml(
  totals: any[],
  invoiceItems?: any[],
  bcMode: boolean = false,
): string {
  if (!Array.isArray(totals) || totals.length === 0) {
    throw new Error("Totals array cannot be empty")
  }

  // Preview mode: calculate totals from invoice items if provided
  const hasInvoiceItems = invoiceItems && invoiceItems.length > 0
  const subtotal = hasInvoiceItems
    ? invoiceItems.reduce((sum: number, item: any) => sum + (parseFloat(item.amount) || 0), 0)
    : 0
  const tax = subtotal * 0.16 // 16% tax (fixed)
  const grandTotal = subtotal + tax

  // Calculate dynamic top position based on table height
  // Table starts at 135mm, header is 12mm, each row is ~10mm, add 10mm spacing
  const tableStart = 135
  const headerHeight = 12
  const rowHeight = 10
  const spacing = 10
  const numRows = invoiceItems && invoiceItems.length > 0 ? invoiceItems.length : 1
  const totalTop = tableStart + headerHeight + (numRows * rowHeight) + spacing
  return totals
    .map((total, idx) => {
      const fieldName = total.fieldName.replace(/[^a-zA-Z0-9_]/g, "_")
      const isFinal = idx === totals.length - 1
      const top = totalTop + idx * 7
      const format = getFormat(total.dataType)
      
      let totalValue: string

      const fieldNameLower = (total.fieldName || "").toLowerCase()

      if (bcMode) {
        // BC mode: align with StandardSalesDraftInvoice header totals in DataSet_Result
        if (fieldNameLower.includes("subtotal")) {
          totalValue = "=Last(Fields!TotalSubTotal.Value)"
        } else if (fieldNameLower.includes("tax")) {
          totalValue = "=Last(Fields!TotalVATAmount.Value)"
        } else if (fieldNameLower.includes("total") && !fieldNameLower.includes("sub")) {
          totalValue = "=Last(Fields!TotalAmountIncludingVAT.Value)"
        } else {
          // Fallback to a generic sum for unsupported labels
          totalValue = buildFieldExpression(total)
        }
      } else {
        // Preview mode: use actual calculated values if invoice items provided,
        // otherwise use a field expression
        totalValue = buildFieldExpression(total)

        if (hasInvoiceItems) {
          if (fieldNameLower.includes("subtotal")) {
            totalValue = subtotal.toFixed(2)
          } else if (fieldNameLower.includes("tax")) {
            totalValue = tax.toFixed(2)
          } else if (fieldNameLower.includes("total") && !fieldNameLower.includes("sub")) {
            totalValue = grandTotal.toFixed(2)
          }
        }
      }

      return `<Textbox Name="Total_${fieldName}">
        <CanGrow>false</CanGrow>
        <CanShrink>false</CanShrink>
        <KeepTogether>true</KeepTogether>
        <Paragraphs>
          <Paragraph>
            <TextRuns>
              <TextRun>
                <Value>${totalValue}</Value>
                <Style>
                  <TextAlign>Right</TextAlign>
                  <FontWeight>${isFinal ? "Bold" : "SemiBold"}</FontWeight>
                  <FontSize>${isFinal ? "13pt" : "11pt"}</FontSize>
                  <Format>${format}</Format>
                  <Color>${isFinal ? "#1e293b" : "#374151"}</Color>
                </Style>
              </TextRun>
            </TextRuns>
          </Paragraph>
        </Paragraphs>
        <Style>
          <TextAlign>Right</TextAlign>
          <FontWeight>${isFinal ? "Bold" : "SemiBold"}</FontWeight>
          <FontSize>${isFinal ? "13pt" : "11pt"}</FontSize>
          <Format>${format}</Format>
          <Color>${isFinal ? "#1e293b" : "#374151"}</Color>
          <TopBorder>
            <Style>${isFinal ? "Solid" : "None"}</Style>
            <Width>${isFinal ? "2pt" : "0.25pt"}</Width>
            <Color>${isFinal ? "#1e293b" : "#FFFFFF"}</Color>
          </TopBorder>
          <BottomBorder>
            <Style>${isFinal ? "Solid" : "None"}</Style>
            <Width>${isFinal ? "2pt" : "0.25pt"}</Width>
            <Color>${isFinal ? "#1e293b" : "#FFFFFF"}</Color>
          </BottomBorder>
          <LeftBorder>
            <Style>None</Style>
            <Width>0.25pt</Width>
            <Color>#FFFFFF</Color>
          </LeftBorder>
          <RightBorder>
            <Style>None</Style>
            <Width>0.25pt</Width>
            <Color>#FFFFFF</Color>
          </RightBorder>
          <BackgroundColor>${isFinal ? "#f1f5f9" : "#FFFFFF"}</BackgroundColor>
          <PaddingRight>2pt</PaddingRight>
          <PaddingTop>${isFinal ? "2pt" : "2pt"}</PaddingTop>
          <PaddingBottom>${isFinal ? "2pt" : "2pt"}</PaddingBottom>
        </Style>
        <Top>${top}mm</Top>
        <Left>130mm</Left>
        <Width>50mm</Width>
        <Height>${isFinal ? "8mm" : "6mm"}</Height>
      </Textbox>
      <Textbox Name="TotalLabel_${fieldName}">
        <CanGrow>false</CanGrow>
        <CanShrink>false</CanShrink>
        <KeepTogether>true</KeepTogether>
        <Paragraphs>
          <Paragraph>
            <TextRuns>
            <TextRun>
              <Value>${escapeXmlValue(total.label)}:</Value>
              <Style>
                <FontFamily>Segoe UI</FontFamily>
                <TextAlign>Right</TextAlign>
                <FontWeight>${isFinal ? "Bold" : "SemiBold"}</FontWeight>
                <FontSize>${isFinal ? "12pt" : "10pt"}</FontSize>
                <Color>${isFinal ? "#1e293b" : "#374151"}</Color>
              </Style>
            </TextRun>
            </TextRuns>
          </Paragraph>
        </Paragraphs>
        <Style>
          <FontFamily>Segoe UI</FontFamily>
          <TextAlign>Right</TextAlign>
          <FontWeight>${isFinal ? "Bold" : "SemiBold"}</FontWeight>
          <FontSize>${isFinal ? "12pt" : "10pt"}</FontSize>
          <Color>${isFinal ? "#1e293b" : "#374151"}</Color>
          <TopBorder>
            <Style>${isFinal ? "Solid" : "None"}</Style>
            <Width>${isFinal ? "1.5pt" : "0.25pt"}</Width>
            <Color>${isFinal ? "#1e293b" : "#FFFFFF"}</Color>
          </TopBorder>
          <BottomBorder>
            <Style>${isFinal ? "Solid" : "None"}</Style>
            <Width>${isFinal ? "1.5pt" : "0.25pt"}</Width>
            <Color>${isFinal ? "#1e293b" : "#FFFFFF"}</Color>
          </BottomBorder>
          <LeftBorder>
            <Style>None</Style>
            <Width>0.25pt</Width>
            <Color>#FFFFFF</Color>
          </LeftBorder>
          <RightBorder>
            <Style>None</Style>
            <Width>0.25pt</Width>
            <Color>#FFFFFF</Color>
          </RightBorder>
          <BackgroundColor>${isFinal ? "#f1f5f9" : "#FFFFFF"}</BackgroundColor>
          <PaddingRight>3pt</PaddingRight>
          <PaddingTop>2pt</PaddingTop>
          <PaddingBottom>2pt</PaddingBottom>
        </Style>
        <Top>${top}mm</Top>
        <Left>70mm</Left>
        <Width>55mm</Width>
        <Height>${isFinal ? "8mm" : "6mm"}</Height>
      </Textbox>`
    })
    .join("\n")
}

function buildFieldExpression(column: any): string {
  const fieldName = column.fieldName.replace(/[^a-zA-Z0-9_]/g, "_")
  return `=Fields!${fieldName}.Value`
}

function getTextAlignment(dataType?: string): string {
  switch (dataType) {
    case "number":
    case "currency":
    case "percentage":
      return "Right"
    default:
      return "Left"
  }
}

function getFormat(dataType?: string, customFormat?: string): string {
  if (customFormat) return customFormat
  switch (dataType) {
    case "currency":
      return "KSH #,##0.00"
    case "percentage":
      return "0.00%"
    case "number":
      return "#,##0.00"
    default:
      return ""
  }
}

// Build item table with BC-compatible field expressions (no hardcoded data)
export function buildItemTableForBC(itemColumns: any[]): string {
  if (!Array.isArray(itemColumns) || itemColumns.length === 0) {
    throw new Error("Item columns array cannot be empty")
  }

  const colCount = itemColumns.length
  const availableWidth = 189
  const colWidth = availableWidth / colCount

  // BC field mapping for item columns - using BC's actual field names from Sales Invoice dataset
  const bcFieldMap: Record<string, string> = {
    description: "Description_Line", // BC uses "Description_Line" not "Description"
    item: "Description_Line",
    quantity: "Quantity_Line", // BC uses "Quantity_Line" not "Quantity"
    price: "UnitPrice", // BC uses "UnitPrice" not "SalesPrice"
    unitprice: "UnitPrice",
    amount: "LineAmount_Line", // BC uses "LineAmount_Line" not "Amount"
    total: "LineAmount_Line",
    lineamount: "LineAmount_Line",
    itemno: "ItemNo_Line", // BC uses "ItemNo_Line" not "Item"
    itemnumber: "ItemNo_Line",
  }

  const headerCells = itemColumns
    .map((col) => {
      const fieldName = col.fieldName.replace(/[^a-zA-Z0-9_]/g, "_")
      return `<TablixCell>
        <CellContents>
          <Textbox Name="Header_${fieldName}">
            <CanGrow>false</CanGrow>
            <CanShrink>false</CanShrink>
            <KeepTogether>true</KeepTogether>
            <Paragraphs>
              <Paragraph>
                <TextRuns>
                  <TextRun>
                    <Value>${escapeXmlValue(col.label)}</Value>
                    <Style>
                      <FontWeight>Bold</FontWeight>
                      <FontSize>11pt</FontSize>
                      <Color>#FFFFFF</Color>
                    </Style>
                  </TextRun>
                </TextRuns>
              </Paragraph>
            </Paragraphs>
            <Style>
              <FontWeight>Bold</FontWeight>
              <FontSize>11pt</FontSize>
              <Color>#FFFFFF</Color>
              <TopBorder>
                <Style>Solid</Style>
                <Width>1pt</Width>
                <Color>#1e293b</Color>
              </TopBorder>
              <BottomBorder>
                <Style>Solid</Style>
                <Width>1pt</Width>
                <Color>#1e293b</Color>
              </BottomBorder>
              <LeftBorder>
                <Style>Solid</Style>
                <Width>1pt</Width>
                <Color>#1e293b</Color>
              </LeftBorder>
              <RightBorder>
                <Style>Solid</Style>
                <Width>1pt</Width>
                <Color>#1e293b</Color>
              </RightBorder>
              <BackgroundColor>#1e293b</BackgroundColor>
              <PaddingLeft>2pt</PaddingLeft>
              <PaddingRight>2pt</PaddingRight>
              <PaddingTop>2pt</PaddingTop>
              <PaddingBottom>2pt</PaddingBottom>
              <TextAlign>${getTextAlignment(col.dataType)}</TextAlign>
            </Style>
          </Textbox>
        </CellContents>
      </TablixCell>`
    })
    .join("\n")

  // Build data row with field expressions (BC will provide the data)
  const getBCFieldExpression = (col: any): string => {
    const fieldName = (col.fieldName || "").toLowerCase()
    const bcField = bcFieldMap[fieldName] || "Description"
    return `=Fields!${bcField}.Value`
  }

  const dataCells = itemColumns
    .map((col) => {
      const fieldName = col.fieldName.replace(/[^a-zA-Z0-9_]/g, "_")
      const bcExpression = getBCFieldExpression(col)
      const format = getFormat(col.dataType, col.format)
      
      return `<TablixCell>
        <CellContents>
          <Textbox Name="Data_${fieldName}">
            <CanGrow>false</CanGrow>
            <CanShrink>false</CanShrink>
            <KeepTogether>true</KeepTogether>
            <Paragraphs>
              <Paragraph>
                <TextRuns>
                  <TextRun>
                    <Value>${bcExpression}</Value>
                    <Style>
                      <TextAlign>${getTextAlignment(col.dataType)}</TextAlign>
                      <Format>${format}</Format>
                      <Color>#1f2937</Color>
                      <FontSize>10pt</FontSize>
                    </Style>
                  </TextRun>
                </TextRuns>
              </Paragraph>
            </Paragraphs>
            <Style>
              <TopBorder>
                <Style>Solid</Style>
                <Width>1pt</Width>
                <Color>#e5e7eb</Color>
              </TopBorder>
              <BottomBorder>
                <Style>Solid</Style>
                <Width>1pt</Width>
                <Color>#e5e7eb</Color>
              </BottomBorder>
              <LeftBorder>
                <Style>Solid</Style>
                <Width>1pt</Width>
                <Color>#e5e7eb</Color>
              </LeftBorder>
              <RightBorder>
                <Style>Solid</Style>
                <Width>1pt</Width>
                <Color>#e5e7eb</Color>
              </RightBorder>
              <BackgroundColor>#ffffff</BackgroundColor>
              <PaddingLeft>2pt</PaddingLeft>
              <PaddingRight>2pt</PaddingRight>
              <PaddingTop>2pt</PaddingTop>
              <PaddingBottom>2pt</PaddingBottom>
              <TextAlign>${getTextAlignment(col.dataType)}</TextAlign>
              <Format>${format}</Format>
              <Color>#1f2937</Color>
              <FontSize>10pt</FontSize>
            </Style>
          </Textbox>
        </CellContents>
      </TablixCell>`
    })
    .join("\n")

  // TablixRowHierarchy must match the number of TablixRows
  // We have 2 rows: 1 header + 1 data
  // Innermost TablixMembers (those with no submembers) must equal number of rows
  // Structure: 1 header member (innermost) + 1 data member with nested member (nested is innermost) = 2 innermost
  const columnMembers = itemColumns.map(() => `<TablixMember />`).join("\n        ")

  return `<Tablix Name="ItemsTable">
    <TablixBody>
      <TablixColumns>
        ${itemColumns.map(() => `<TablixColumn><Width>${colWidth.toFixed(2)}mm</Width></TablixColumn>`).join("\n        ")}
      </TablixColumns>
      <TablixRows>
        <TablixRow>
          <Height>12mm</Height>
          <TablixCells>
            ${headerCells}
          </TablixCells>
        </TablixRow>
        <TablixRow>
          <Height>10mm</Height>
          <TablixCells>
            ${dataCells}
          </TablixCells>
        </TablixRow>
      </TablixRows>
    </TablixBody>
    <TablixRowHierarchy>
      <TablixMembers>
        <TablixMember>
          <KeepWithGroup>After</KeepWithGroup>
        </TablixMember>
        <TablixMember>
          <Group Name="Details" />
          <TablixMembers>
            <TablixMember />
          </TablixMembers>
        </TablixMember>
      </TablixMembers>
    </TablixRowHierarchy>
    <TablixColumnHierarchy>
      <TablixMembers>
        ${columnMembers}
      </TablixMembers>
    </TablixColumnHierarchy>
    <Top>120mm</Top>
    <Left>10mm</Left>
    <Width>${availableWidth}mm</Width>
    <Height>60mm</Height>
  </Tablix>`
}

// Build item table with actual invoice items data
export function buildItemTableWithData(itemColumns: any[], invoiceItems: any[]): string {
  if (!Array.isArray(itemColumns) || itemColumns.length === 0) {
    throw new Error("Item columns array cannot be empty")
  }

  const colCount = itemColumns.length
  // Fixed column width - use layout engine specification (189mm total width)
  const availableWidth = 189
  const colWidth = availableWidth / colCount

  const headerCells = itemColumns
    .map((col) => {
      const fieldName = col.fieldName.replace(/[^a-zA-Z0-9_]/g, "_")
      return `<TablixCell>
        <CellContents>
          <Textbox Name="Header_${fieldName}">
            <CanGrow>false</CanGrow>
            <CanShrink>false</CanShrink>
            <KeepTogether>true</KeepTogether>
            <Paragraphs>
              <Paragraph>
                <TextRuns>
                  <TextRun>
                    <Value>${escapeXmlValue(col.label)}</Value>
                    <Style>
                      <FontWeight>Bold</FontWeight>
                      <FontSize>11pt</FontSize>
                      <Color>#FFFFFF</Color>
                    </Style>
                  </TextRun>
                </TextRuns>
              </Paragraph>
            </Paragraphs>
            <Style>
              <FontWeight>Bold</FontWeight>
              <FontSize>11pt</FontSize>
              <Color>#FFFFFF</Color>
              <TopBorder>
                <Style>Solid</Style>
                <Width>1pt</Width>
                <Color>#1e293b</Color>
              </TopBorder>
              <BottomBorder>
                <Style>Solid</Style>
                <Width>1pt</Width>
                <Color>#1e293b</Color>
              </BottomBorder>
              <LeftBorder>
                <Style>Solid</Style>
                <Width>1pt</Width>
                <Color>#1e293b</Color>
              </LeftBorder>
              <RightBorder>
                <Style>Solid</Style>
                <Width>1pt</Width>
                <Color>#1e293b</Color>
              </RightBorder>
              <BackgroundColor>#1e293b</BackgroundColor>
              <PaddingLeft>2pt</PaddingLeft>
              <PaddingRight>2pt</PaddingRight>
              <PaddingTop>2pt</PaddingTop>
              <PaddingBottom>2pt</PaddingBottom>
              <TextAlign>${getTextAlignment(col.dataType)}</TextAlign>
            </Style>
          </Textbox>
        </CellContents>
      </TablixCell>`
    })
    .join("\n")

  // Build data rows from actual invoice items
  const getItemValue = (item: any, col: any) => {
    const fieldName = (col.fieldName || "").toLowerCase()
    
    if (fieldName.includes("description") || fieldName.includes("item")) {
      return escapeXmlValue(item.description || "")
    } else if (fieldName.includes("quantity")) {
      return item.quantity || "0"
    } else if (fieldName.includes("price") || fieldName.includes("unit")) {
      return item.price || "0.00"
    } else if (fieldName.includes("amount") || fieldName.includes("total") || fieldName.includes("line")) {
      return item.amount || "0.00"
    } else {
      return ""
    }
  }

  const dataRows = invoiceItems.length > 0
    ? invoiceItems
        .map((item, rowIdx) => {
          const dataCells = itemColumns
            .map((col) => {
              const fieldName = col.fieldName.replace(/[^a-zA-Z0-9_]/g, "_")
              const value = getItemValue(item, col)
              const format = getFormat(col.dataType, col.format)
              
              return `<TablixCell>
        <CellContents>
          <Textbox Name="Data_${fieldName}_Row${rowIdx}">
            <CanGrow>false</CanGrow>
            <CanShrink>false</CanShrink>
            <KeepTogether>true</KeepTogether>
            <Paragraphs>
              <Paragraph>
                <TextRuns>
                  <TextRun>
                    <Value>${value}</Value>
                    <Style>
                      <TextAlign>${getTextAlignment(col.dataType)}</TextAlign>
                      <Format>${format}</Format>
                      <Color>#1f2937</Color>
                      <FontSize>10pt</FontSize>
                    </Style>
                  </TextRun>
                </TextRuns>
              </Paragraph>
            </Paragraphs>
            <Style>
              <TopBorder>
                <Style>Solid</Style>
                <Width>1pt</Width>
                <Color>#e5e7eb</Color>
              </TopBorder>
              <BottomBorder>
                <Style>Solid</Style>
                <Width>1pt</Width>
                <Color>#e5e7eb</Color>
              </BottomBorder>
              <LeftBorder>
                <Style>Solid</Style>
                <Width>1pt</Width>
                <Color>#e5e7eb</Color>
              </LeftBorder>
              <RightBorder>
                <Style>Solid</Style>
                <Width>1pt</Width>
                <Color>#e5e7eb</Color>
              </RightBorder>
              <BackgroundColor>${rowIdx % 2 === 0 ? "#f9fafb" : "#ffffff"}</BackgroundColor>
              <PaddingLeft>2pt</PaddingLeft>
              <PaddingRight>2pt</PaddingRight>
              <PaddingTop>2pt</PaddingTop>
              <PaddingBottom>2pt</PaddingBottom>
              <TextAlign>${getTextAlignment(col.dataType)}</TextAlign>
              <Format>${format}</Format>
              <Color>#1f2937</Color>
              <FontSize>10pt</FontSize>
            </Style>
          </Textbox>
        </CellContents>
      </TablixCell>`
            })
            .join("\n")
          
          return `<TablixRow>
                <Height>10mm</Height>
                <TablixCells>
                  ${dataCells}
                </TablixCells>
              </TablixRow>`
        })
        .join("\n")
    : `<TablixRow>
                <Height>10mm</Height>
                <TablixCells>
                  ${itemColumns
                  .map((col) => {
                    const fieldName = col.fieldName.replace(/[^a-zA-Z0-9_]/g, "_")
                    return `<TablixCell>
        <CellContents>
          <Textbox Name="Data_${fieldName}">
            <CanGrow>false</CanGrow>
            <CanShrink>false</CanShrink>
            <KeepTogether>true</KeepTogether>
            <Paragraphs>
              <Paragraph>
                <TextRuns>
                  <TextRun>
                    <Value>=Fields!${fieldName}.Value</Value>
                    <Style>
                      <Color>#1f2937</Color>
                      <FontSize>10pt</FontSize>
                    </Style>
                  </TextRun>
                </TextRuns>
              </Paragraph>
            </Paragraphs>
            <Style>
              <TopBorder>
                <Style>Solid</Style>
                <Width>1pt</Width>
                <Color>#e5e7eb</Color>
              </TopBorder>
              <BottomBorder>
                <Style>Solid</Style>
                <Width>1pt</Width>
                <Color>#e5e7eb</Color>
              </BottomBorder>
              <LeftBorder>
                <Style>Solid</Style>
                <Width>1pt</Width>
                <Color>#e5e7eb</Color>
              </LeftBorder>
              <RightBorder>
                <Style>Solid</Style>
                <Width>1pt</Width>
                <Color>#e5e7eb</Color>
              </RightBorder>
              <BackgroundColor>#ffffff</BackgroundColor>
              <PaddingLeft>2pt</PaddingLeft>
              <PaddingRight>2pt</PaddingRight>
              <PaddingTop>2pt</PaddingTop>
              <PaddingBottom>2pt</PaddingBottom>
              <TextAlign>${getTextAlignment(col.dataType)}</TextAlign>
              <Format>${getFormat(col.dataType, col.format)}</Format>
              <Color>#1f2937</Color>
              <FontSize>10pt</FontSize>
            </Style>
          </Textbox>
        </CellContents>
      </TablixCell>`
                  })
                  .join("\n")}
                </TablixCells>
              </TablixRow>`

  const columnDefs = itemColumns
    .map(
      () => `<TablixColumn>
      <Width>${colWidth.toFixed(2)}mm</Width>
    </TablixColumn>`,
    )
    .join("\n")
  
  const columnMembers = itemColumns
    .map(() => `<TablixMember />`)
    .join("\n        ")

  return `<Tablix Name="ItemsTable">
    <TablixBody>
      <TablixColumns>
        ${columnDefs}
      </TablixColumns>
      <TablixRows>
        <TablixRow>
          <Height>12mm</Height>
          <TablixCells>
            ${headerCells}
          </TablixCells>
        </TablixRow>
        ${dataRows}
      </TablixRows>
    </TablixBody>
    <TablixRowHierarchy>
      <TablixMembers>
        <TablixMember>
          <KeepWithGroup>After</KeepWithGroup>
        </TablixMember>
        <TablixMember>
          <Group Name="Details" />
          <TablixMembers>
            <TablixMember />
          </TablixMembers>
        </TablixMember>
      </TablixMembers>
    </TablixRowHierarchy>
    <TablixColumnHierarchy>
      <TablixMembers>
        ${columnMembers}
      </TablixMembers>
    </TablixColumnHierarchy>
    <Top>115mm</Top>
    <Left>10.58mm</Left>
    <Width>189mm</Width>
    <Height>60mm</Height>
    <ZIndex>1</ZIndex>
  </Tablix>`
}
