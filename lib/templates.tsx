const SIMPLE_INVOICE_TEMPLATE = `<?xml version="1.0" encoding="utf-8"?>
<Report xmlns="http://schemas.microsoft.com/sqlserver/reporting/2016/01/reportdefinition" xmlns:rd="http://schemas.microsoft.com/sqlserver/reporting/2016/01/reportdefinition/reportdesigner">
  <AutoRefresh>0</AutoRefresh>
  <DataSources>
    <DataSource Name="DataSource">
      <rd:SecurityType>Integrated</rd:SecurityType>
      <ConnectionProperties>
        <DataProvider>ENTERDATA</DataProvider>
        <ConnectString />
        <IntegratedSecurity>true</IntegratedSecurity>
      </ConnectionProperties>
      <rd:DataSourceID>d14c9c4f-2b77-4b1c-b226-eda92723379b</rd:DataSourceID>
    </DataSource>
  </DataSources>
  <DataSets>
    <DataSet Name="InvoiceDataset">
      <Query>
        <DataSourceName>DataSource</DataSourceName>
        <CommandText />
      </Query>
      <Fields>
        <Field Name="InvoiceNo">
          <DataField>InvoiceNo</DataField>
        </Field>
        <Field Name="InvoiceDate">
          <DataField>InvoiceDate</DataField>
        </Field>
        <Field Name="CustomerName">
          <DataField>CustomerName</DataField>
        </Field>
        <Field Name="Description">
          <DataField>Description</DataField>
        </Field>
        <Field Name="Quantity">
          <DataField>Quantity</DataField>
        </Field>
        <Field Name="UnitPrice">
          <DataField>UnitPrice</DataField>
        </Field>
        <Field Name="LineAmount">
          <DataField>LineAmount</DataField>
        </Field>
        <Field Name="Subtotal">
          <DataField>Subtotal</DataField>
        </Field>
        <Field Name="Tax">
          <DataField>Tax</DataField>
        </Field>
        <Field Name="GrandTotal">
          <DataField>GrandTotal</DataField>
        </Field>
      </Fields>
    </DataSet>
  </DataSets>
  <ReportSections>
    <ReportSection>
      <Body>
        <Height>0cm</Height>
        <ReportItems>
          <Textbox Name="CompanyHeader">
            <Paragraphs>
              <Paragraph>
                <TextRuns>
                  <TextRun>
                    <Value>{COMPANY_NAME}</Value>
                    <Style>
                      <FontSize>20pt</FontSize>
                      <FontWeight>Bold</FontWeight>
                    </Style>
                  </TextRun>
                </TextRuns>
              </Paragraph>
            </Paragraphs>
            <Style>
              <FontSize>20pt</FontSize>
              <FontWeight>Bold</FontWeight>
            </Style>
            <Top>10mm</Top>
            <Left>10mm</Left>
            <Width>100mm</Width>
            <Height>10mm</Height>
            <CanGrow>false</CanGrow>
            <CanShrink>false</CanShrink>
          </Textbox>
          <Textbox Name="CompanyAddress">
            <Paragraphs>
              <Paragraph>
                <TextRuns>
                  <TextRun>
                    <Value>{COMPANY_ADDRESS}</Value>
                    <Style>
                      <FontSize>10pt</FontSize>
                    </Style>
                  </TextRun>
                </TextRuns>
              </Paragraph>
            </Paragraphs>
            <Style>
              <FontSize>10pt</FontSize>
            </Style>
            <Top>25mm</Top>
            <Left>10mm</Left>
            <Width>100mm</Width>
            <Height>8mm</Height>
            <CanGrow>false</CanGrow>
            <CanShrink>false</CanShrink>
          </Textbox>
          <Textbox Name="InvoiceTitle">
            <Paragraphs>
              <Paragraph>
                <TextRuns>
                  <TextRun>
                    <Value>{INVOICE_TITLE}</Value>
                    <Style>
                      <FontSize>16pt</FontSize>
                      <FontWeight>Bold</FontWeight>
                    </Style>
                  </TextRun>
                </TextRuns>
              </Paragraph>
            </Paragraphs>
            <Style>
              <FontSize>16pt</FontSize>
              <FontWeight>Bold</FontWeight>
            </Style>
            <Top>10mm</Top>
            <Left>130mm</Left>
            <Width>50mm</Width>
            <Height>10mm</Height>
            <CanGrow>false</CanGrow>
            <CanShrink>false</CanShrink>
          </Textbox>
          <Textbox Name="InvoiceNumberLabel">
            <Paragraphs>
              <Paragraph>
                <TextRuns>
                  <TextRun>
                    <Value>Invoice Number:</Value>
                    <Style>
                      <FontSize>11pt</FontSize>
                      <FontWeight>Bold</FontWeight>
                    </Style>
                  </TextRun>
                </TextRuns>
              </Paragraph>
            </Paragraphs>
            <Style>
              <FontSize>11pt</FontSize>
              <FontWeight>Bold</FontWeight>
            </Style>
            <Top>35mm</Top>
            <Left>130mm</Left>
            <Width>30mm</Width>
            <Height>6mm</Height>
            <CanGrow>false</CanGrow>
            <CanShrink>false</CanShrink>
          </Textbox>
          <Textbox Name="InvoiceNumber">
            <Paragraphs>
              <Paragraph>
                <TextRuns>
                  <TextRun>
                    <Value>{INVOICE_NUMBER}</Value>
                    <Style>
                      <FontSize>11pt</FontSize>
                    </Style>
                  </TextRun>
                </TextRuns>
              </Paragraph>
            </Paragraphs>
            <Style>
              <FontSize>11pt</FontSize>
            </Style>
            <Top>35mm</Top>
            <Left>165mm</Left>
            <Width>30mm</Width>
            <Height>6mm</Height>
            <CanGrow>false</CanGrow>
            <CanShrink>false</CanShrink>
          </Textbox>
          <Textbox Name="InvoiceDateLabel">
            <Paragraphs>
              <Paragraph>
                <TextRuns>
                  <TextRun>
                    <Value>Invoice Date:</Value>
                    <Style>
                      <FontSize>11pt</FontSize>
                      <FontWeight>Bold</FontWeight>
                    </Style>
                  </TextRun>
                </TextRuns>
              </Paragraph>
            </Paragraphs>
            <Style>
              <FontSize>11pt</FontSize>
              <FontWeight>Bold</FontWeight>
            </Style>
            <Top>42mm</Top>
            <Left>130mm</Left>
            <Width>30mm</Width>
            <Height>6mm</Height>
            <CanGrow>false</CanGrow>
            <CanShrink>false</CanShrink>
          </Textbox>
          <Textbox Name="InvoiceDate">
            <Paragraphs>
              <Paragraph>
                <TextRuns>
                  <TextRun>
                    <Value>{INVOICE_DATE}</Value>
                    <Style>
                      <FontSize>11pt</FontSize>
                    </Style>
                  </TextRun>
                </TextRuns>
              </Paragraph>
            </Paragraphs>
            <Style>
              <FontSize>11pt</FontSize>
            </Style>
            <Top>42mm</Top>
            <Left>165mm</Left>
            <Width>30mm</Width>
            <Height>6mm</Height>
            <CanGrow>false</CanGrow>
            <CanShrink>false</CanShrink>
          </Textbox>
          <Textbox Name="CustomerNameLabel">
            <Paragraphs>
              <Paragraph>
                <TextRuns>
                  <TextRun>
                    <Value>Bill To:</Value>
                    <Style>
                      <FontSize>11pt</FontSize>
                      <FontWeight>Bold</FontWeight>
                    </Style>
                  </TextRun>
                </TextRuns>
              </Paragraph>
            </Paragraphs>
            <Style>
              <FontSize>11pt</FontSize>
              <FontWeight>Bold</FontWeight>
            </Style>
            <Top>55mm</Top>
            <Left>10mm</Left>
            <Width>30mm</Width>
            <Height>6mm</Height>
            <CanGrow>false</CanGrow>
            <CanShrink>false</CanShrink>
          </Textbox>
          <Textbox Name="CustomerName">
            <Paragraphs>
              <Paragraph>
                <TextRuns>
                  <TextRun>
                    <Value>{CUSTOMER_NAME}</Value>
                    <Style>
                      <FontSize>11pt</FontSize>
                    </Style>
                  </TextRun>
                </TextRuns>
              </Paragraph>
            </Paragraphs>
            <Style>
              <FontSize>11pt</FontSize>
            </Style>
            <Top>55mm</Top>
            <Left>10mm</Left>
            <Width>100mm</Width>
            <Height>6mm</Height>
          </Textbox>
          <Textbox Name="CustomerAddress">
            <Paragraphs>
              <Paragraph>
                <TextRuns>
                  <TextRun>
                    <Value>{CUSTOMER_ADDRESS}</Value>
                    <Style>
                      <FontSize>10pt</FontSize>
                    </Style>
                  </TextRun>
                </TextRuns>
              </Paragraph>
            </Paragraphs>
            <Style>
              <FontSize>10pt</FontSize>
            </Style>
            <Top>62mm</Top>
            <Left>10mm</Left>
            <Width>100mm</Width>
            <Height>8mm</Height>
          </Textbox>
          {ITEM_TABLE_XML}
          {TOTALS_SECTION}
          {FOOTER_SECTION}
        </ReportItems>
      </Body>
      <Width>21cm</Width>
      <Page>
        <PageHeader>
          <Height>0cm</Height>
        </PageHeader>
        <PageFooter>
          <Height>0cm</Height>
        </PageFooter>
        <Columns>1</Columns>
      </Page>
    </ReportSection>
  </ReportSections>
</Report>`

const MODERN_INVOICE_TEMPLATE = `<?xml version="1.0" encoding="utf-8"?>
<Report xmlns="http://schemas.microsoft.com/sqlserver/reporting/2016/01/reportdefinition" xmlns:rd="http://schemas.microsoft.com/sqlserver/reporting/2016/01/reportdefinition/reportdesigner">
  <AutoRefresh>0</AutoRefresh>
  <DataSources>
    <DataSource Name="DataSource">
      <rd:SecurityType>Integrated</rd:SecurityType>
      <ConnectionProperties>
        <DataProvider>ENTERDATA</DataProvider>
        <ConnectString />
        <IntegratedSecurity>true</IntegratedSecurity>
      </ConnectionProperties>
      <rd:DataSourceID>d14c9c4f-2b77-4b1c-b226-eda92723379b</rd:DataSourceID>
    </DataSource>
  </DataSources>
  <DataSets>
    <DataSet Name="InvoiceDataset">
      <Query>
        <DataSourceName>DataSource</DataSourceName>
        <CommandText />
      </Query>
      <Fields>
        <Field Name="InvoiceNo">
          <DataField>InvoiceNo</DataField>
        </Field>
        <Field Name="InvoiceDate">
          <DataField>InvoiceDate</DataField>
        </Field>
        <Field Name="CustomerName">
          <DataField>CustomerName</DataField>
        </Field>
        <Field Name="Description">
          <DataField>Description</DataField>
        </Field>
        <Field Name="Quantity">
          <DataField>Quantity</DataField>
        </Field>
        <Field Name="UnitPrice">
          <DataField>UnitPrice</DataField>
        </Field>
        <Field Name="LineAmount">
          <DataField>LineAmount</DataField>
        </Field>
        <Field Name="Subtotal">
          <DataField>Subtotal</DataField>
        </Field>
        <Field Name="Tax">
          <DataField>Tax</DataField>
        </Field>
        <Field Name="GrandTotal">
          <DataField>GrandTotal</DataField>
        </Field>
      </Fields>
    </DataSet>
  </DataSets>
  <ReportSections>
    <ReportSection>
      <Body>
        <Height>0cm</Height>
        <ReportItems>
          <!-- Header Section - matches preview exactly: padding 40px, flex layout -->
          <Rectangle Name="HeaderBackground">
            <ReportItems>
              <!-- Company Name - positioned to match preview flex layout -->
              <Textbox Name="CompanyName">
                <Paragraphs>
                  <Paragraph>
                    <TextRuns>
                      <TextRun>
                        <Value>{COMPANY_NAME}</Value>
                        <Style>
                          <FontFamily>Segoe UI</FontFamily>
                          <FontSize>28pt</FontSize>
                          <FontWeight>Bold</FontWeight>
                          <Color>#FFFFFF</Color>
                        </Style>
                      </TextRun>
                    </TextRuns>
                  </Paragraph>
                </Paragraphs>
                <Style>
                  <FontFamily>Segoe UI</FontFamily>
                  <FontSize>28pt</FontSize>
                  <FontWeight>Bold</FontWeight>
                  <Color>#FFFFFF</Color>
                </Style>
                <Top>10.58mm</Top>
                <Left>10.58mm</Left>
                <Width>100mm</Width>
                <Height>12mm</Height>
                <CanGrow>false</CanGrow>
                <CanShrink>false</CanShrink>
              </Textbox>
              
              <!-- Company Address - positioned below company name with proper spacing -->
              <Textbox Name="CompanyAddress">
                <Paragraphs>
                  <Paragraph>
                    <TextRuns>
                      <TextRun>
                        <Value>{COMPANY_ADDRESS}</Value>
                        <Style>
                          <FontFamily>Segoe UI</FontFamily>
                          <FontSize>10pt</FontSize>
                          <Color>#FFFFFF</Color>
                        </Style>
                      </TextRun>
                    </TextRuns>
                  </Paragraph>
                </Paragraphs>
                <Style>
                  <FontFamily>Segoe UI</FontFamily>
                  <FontSize>10pt</FontSize>
                  <Color>#FFFFFF</Color>
                </Style>
                <Top>25mm</Top>
                <Left>10.58mm</Left>
                <Width>100mm</Width>
                <Height>12mm</Height>
                <CanGrow>false</CanGrow>
                <CanShrink>false</CanShrink>
              </Textbox>
              
              <!-- Invoice Meta Box - positioned on right side matching preview -->
              <Rectangle Name="InvoiceMetaBox">
                <ReportItems>
                  <!-- Invoice Title -->
                  <Textbox Name="InvoiceTitle">
                    <Paragraphs>
                      <Paragraph>
                        <TextRuns>
                          <TextRun>
                            <Value>{INVOICE_TITLE}</Value>
                            <Style>
                              <FontFamily>Segoe UI</FontFamily>
                              <FontSize>22pt</FontSize>
                              <FontWeight>Bold</FontWeight>
                              <Color>#FFFFFF</Color>
                            </Style>
                          </TextRun>
                        </TextRuns>
                      </Paragraph>
                    </Paragraphs>
                    <Style>
                      <FontFamily>Segoe UI</FontFamily>
                      <FontSize>22pt</FontSize>
                      <FontWeight>Bold</FontWeight>
                      <Color>#FFFFFF</Color>
                      <TextAlign>Right</TextAlign>
                    </Style>
                    <Top>5.29mm</Top>
                    <Left>0mm</Left>
                    <Width>55mm</Width>
                    <Height>12mm</Height>
                    <CanGrow>false</CanGrow>
                    <CanShrink>false</CanShrink>
                  </Textbox>
                  
                  <!-- Invoice Number -->
                  <Textbox Name="InvoiceNumber">
                    <Paragraphs>
                      <Paragraph>
                        <TextRuns>
                          <TextRun>
                            <Value>Invoice No:</Value>
                            <Style>
                              <FontFamily>Segoe UI</FontFamily>
                              <FontSize>9pt</FontSize>
                              <FontWeight>SemiBold</FontWeight>
                              <Color>#E5E7EB</Color>
                            </Style>
                          </TextRun>
                          <TextRun>
                            <Value xml:space="preserve"> </Value>
                            <Style>
                              <FontFamily>Segoe UI</FontFamily>
                              <FontSize>9pt</FontSize>
                              <Color>#E5E7EB</Color>
                            </Style>
                          </TextRun>
                          <TextRun>
                            <Value>{INVOICE_NUMBER}</Value>
                            <Style>
                              <FontFamily>Segoe UI</FontFamily>
                              <FontSize>9pt</FontSize>
                              <Color>#FFFFFF</Color>
                            </Style>
                          </TextRun>
                        </TextRuns>
                      </Paragraph>
                    </Paragraphs>
                    <Style>
                      <FontFamily>Segoe UI</FontFamily>
                      <FontSize>9pt</FontSize>
                      <Color>#FFFFFF</Color>
                      <TextAlign>Right</TextAlign>
                    </Style>
                    <Top>20mm</Top>
                    <Left>0mm</Left>
                    <Width>55mm</Width>
                    <Height>6mm</Height>
                    <CanGrow>false</CanGrow>
                    <CanShrink>false</CanShrink>
                  </Textbox>
                  
                  <!-- Invoice Date -->
                  <Textbox Name="InvoiceDate">
                    <Paragraphs>
                      <Paragraph>
                        <TextRuns>
                          <TextRun>
                            <Value>Date:</Value>
                            <Style>
                              <FontFamily>Segoe UI</FontFamily>
                              <FontSize>9pt</FontSize>
                              <FontWeight>SemiBold</FontWeight>
                              <Color>#E5E7EB</Color>
                            </Style>
                          </TextRun>
                          <TextRun>
                            <Value xml:space="preserve"> </Value>
                            <Style>
                              <FontFamily>Segoe UI</FontFamily>
                              <FontSize>9pt</FontSize>
                              <Color>#E5E7EB</Color>
                            </Style>
                          </TextRun>
                          <TextRun>
                            <Value>{INVOICE_DATE}</Value>
                            <Style>
                              <FontFamily>Segoe UI</FontFamily>
                              <FontSize>9pt</FontSize>
                              <Color>#FFFFFF</Color>
                            </Style>
                          </TextRun>
                        </TextRuns>
                      </Paragraph>
                    </Paragraphs>
                    <Style>
                      <FontFamily>Segoe UI</FontFamily>
                      <FontSize>9pt</FontSize>
                      <Color>#FFFFFF</Color>
                      <TextAlign>Right</TextAlign>
                    </Style>
                    <Top>28mm</Top>
                    <Left>0mm</Left>
                    <Width>55mm</Width>
                    <Height>6mm</Height>
                    <CanGrow>false</CanGrow>
                    <CanShrink>false</CanShrink>
                  </Textbox>
                  <!-- Due Date -->
                  <Textbox Name="InvoiceDueDate">
                    <Paragraphs>
                      <Paragraph>
                        <TextRuns>
                          <TextRun>
                            <Value>Due:</Value>
                            <Style>
                              <FontFamily>Segoe UI</FontFamily>
                              <FontSize>8pt</FontSize>
                              <FontWeight>SemiBold</FontWeight>
                              <Color>#E5E7EB</Color>
                            </Style>
                          </TextRun>
                          <TextRun>
                            <Value xml:space="preserve"> </Value>
                            <Style>
                              <FontFamily>Segoe UI</FontFamily>
                              <FontSize>8pt</FontSize>
                              <Color>#E5E7EB</Color>
                            </Style>
                          </TextRun>
                          <TextRun>
                            <Value>{DUE_DATE}</Value>
                            <Style>
                              <FontFamily>Segoe UI</FontFamily>
                              <FontSize>8pt</FontSize>
                              <Color>#FFFFFF</Color>
                            </Style>
                          </TextRun>
                        </TextRuns>
                      </Paragraph>
                    </Paragraphs>
                    <Style>
                      <FontFamily>Segoe UI</FontFamily>
                      <FontSize>8pt</FontSize>
                      <Color>#FFFFFF</Color>
                      <TextAlign>Right</TextAlign>
                    </Style>
                    <Top>36mm</Top>
                    <Left>0mm</Left>
                    <Width>55mm</Width>
                    <Height>6mm</Height>
                    <CanGrow>false</CanGrow>
                    <CanShrink>false</CanShrink>
                  </Textbox>
                </ReportItems>
                <Style>
                  <BackgroundColor>#2d4a6f</BackgroundColor>
                </Style>
                <Top>10.58mm</Top>
                <Left>144mm</Left>
                <Width>55mm</Width>
                <Height>40mm</Height>
                <ZIndex>1</ZIndex>
              </Rectangle>
            </ReportItems>
            <Style>
              <BackgroundColor>#1e3a5f</BackgroundColor>
            </Style>
            <Top>0mm</Top>
            <Left>0mm</Left>
            <Width>210mm</Width>
            <Height>60mm</Height>
          </Rectangle>
          
          <!-- Body padding area - matches preview padding 40px -->
          <!-- Bill From Section - matches preview grid layout: left column -->
          <Rectangle Name="BillFromBox">
            <ReportItems>
              <Textbox Name="BillFromLabel">
                <Paragraphs>
                  <Paragraph>
                    <TextRuns>
                      <TextRun>
                        <Value>BILL FROM</Value>
                        <Style>
                          <FontFamily>Segoe UI</FontFamily>
                          <FontSize>9pt</FontSize>
                          <FontWeight>Bold</FontWeight>
                          <Color>#6b7280</Color>
                        </Style>
                      </TextRun>
                    </TextRuns>
                  </Paragraph>
            </Paragraphs>
            <Style>
              <FontFamily>Segoe UI</FontFamily>
              <FontSize>9pt</FontSize>
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
              <Textbox Name="BillFromName">
                <Paragraphs>
                  <Paragraph>
                    <TextRuns>
                      <TextRun>
                        <Value>{COMPANY_NAME}</Value>
                        <Style>
                          <FontFamily>Segoe UI</FontFamily>
                          <FontSize>11pt</FontSize>
                          <FontWeight>Bold</FontWeight>
                          <Color>#1f2937</Color>
                        </Style>
                      </TextRun>
                    </TextRuns>
                  </Paragraph>
                </Paragraphs>
                <Style>
                  <FontFamily>Segoe UI</FontFamily>
                  <FontSize>11pt</FontSize>
                  <FontWeight>Bold</FontWeight>
                  <Color>#1f2937</Color>
                </Style>
                <Top>12mm</Top>
                <Left>5.29mm</Left>
                <Width>80mm</Width>
                <Height>6mm</Height>
                <CanGrow>false</CanGrow>
                <CanShrink>false</CanShrink>
              </Textbox>
              <Textbox Name="BillFromAddress">
                <Paragraphs>
                  <Paragraph>
                    <TextRuns>
                      <TextRun>
                        <Value>{COMPANY_ADDRESS}</Value>
                        <Style>
                          <FontFamily>Segoe UI</FontFamily>
                          <FontSize>10pt</FontSize>
                          <Color>#1f2937</Color>
                        </Style>
                      </TextRun>
                    </TextRuns>
                  </Paragraph>
                </Paragraphs>
                <Style>
                  <FontFamily>Segoe UI</FontFamily>
                  <FontSize>10pt</FontSize>
                  <Color>#1f2937</Color>
                </Style>
                <Top>18mm</Top>
                <Left>5.29mm</Left>
                <Width>80mm</Width>
                <Height>12mm</Height>
                <CanGrow>false</CanGrow>
                <CanShrink>false</CanShrink>
              </Textbox>
            </ReportItems>
            <Style>
              <BackgroundColor>#f9fafb</BackgroundColor>
              <LeftBorder>
                <Style>Solid</Style>
                <Width>1.06mm</Width>
                <Color>#3b82f6</Color>
              </LeftBorder>
            </Style>
            <Top>70mm</Top>
            <Left>10.58mm</Left>
            <Width>85mm</Width>
            <Height>35mm</Height>
          </Rectangle>
          
          <!-- Bill To Section - matches preview grid layout: right column -->
          <Rectangle Name="BillToBox">
            <ReportItems>
              <Textbox Name="BillToLabel">
                <Paragraphs>
                  <Paragraph>
                    <TextRuns>
                      <TextRun>
                        <Value>BILL TO</Value>
                        <Style>
                          <FontFamily>Segoe UI</FontFamily>
                          <FontSize>9pt</FontSize>
                          <FontWeight>Bold</FontWeight>
                          <Color>#6b7280</Color>
                        </Style>
                      </TextRun>
                    </TextRuns>
                  </Paragraph>
            </Paragraphs>
            <Style>
              <FontFamily>Segoe UI</FontFamily>
              <FontSize>9pt</FontSize>
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
              <Textbox Name="BillToName">
                <Paragraphs>
                  <Paragraph>
                    <TextRuns>
                      <TextRun>
                        <Value>{CUSTOMER_NAME}</Value>
                        <Style>
                          <FontFamily>Segoe UI</FontFamily>
                          <FontSize>11pt</FontSize>
                          <FontWeight>Bold</FontWeight>
                          <Color>#1f2937</Color>
                        </Style>
                      </TextRun>
                    </TextRuns>
                  </Paragraph>
                </Paragraphs>
                <Style>
                  <FontFamily>Segoe UI</FontFamily>
                  <FontSize>11pt</FontSize>
                  <FontWeight>Bold</FontWeight>
                  <Color>#1f2937</Color>
                </Style>
                <Top>12mm</Top>
                <Left>5.29mm</Left>
                <Width>80mm</Width>
                <Height>6mm</Height>
                <CanGrow>false</CanGrow>
                <CanShrink>false</CanShrink>
              </Textbox>
              <Textbox Name="BillToAddress">
                <Paragraphs>
                  <Paragraph>
                    <TextRuns>
                      <TextRun>
                        <Value>{CUSTOMER_ADDRESS}</Value>
                        <Style>
                          <FontFamily>Segoe UI</FontFamily>
                          <FontSize>10pt</FontSize>
                          <Color>#1f2937</Color>
                        </Style>
                      </TextRun>
                    </TextRuns>
                  </Paragraph>
                </Paragraphs>
                <Style>
                  <FontFamily>Segoe UI</FontFamily>
                  <FontSize>10pt</FontSize>
                  <Color>#1f2937</Color>
                </Style>
                <Top>18mm</Top>
                <Left>5.29mm</Left>
                <Width>80mm</Width>
                <Height>12mm</Height>
                <CanGrow>false</CanGrow>
                <CanShrink>false</CanShrink>
              </Textbox>
              {CUSTOMER_COMPANY}
              {CUSTOMER_EMAIL}
            </ReportItems>
            <Style>
              <BackgroundColor>#f9fafb</BackgroundColor>
              <LeftBorder>
                <Style>Solid</Style>
                <Width>1.06mm</Width>
                <Color>#3b82f6</Color>
              </LeftBorder>
            </Style>
            <Top>70mm</Top>
            <Left>115mm</Left>
            <Width>85mm</Width>
            <Height>35mm</Height>
          </Rectangle>
          
          <!-- Items Table - positioned after billing section with proper spacing -->
          {ITEM_TABLE_XML}
          
          <!-- Totals Section -->
          {TOTALS_SECTION}
          
          <!-- Ship To Section (conditional) -->
          {SHIP_TO_SECTION}
          
          <!-- Payment Section (conditional) -->
          {PAYMENT_SECTION}
          
          <!-- Footer (conditional) -->
          {FOOTER_SECTION}
        </ReportItems>
      </Body>
      <Width>21cm</Width>
      <Page>
        <PageHeader>
          <Height>0cm</Height>
        </PageHeader>
        <PageFooter>
          <Height>0cm</Height>
        </PageFooter>
        <Columns>1</Columns>
      </Page>
    </ReportSection>
  </ReportSections>
</Report>`

const CORPORATE_INVOICE_TEMPLATE = `<?xml version="1.0" encoding="utf-8"?>
<Report xmlns="http://schemas.microsoft.com/sqlserver/reporting/2016/01/reportdefinition" xmlns:rd="http://schemas.microsoft.com/sqlserver/reporting/2016/01/reportdefinition/reportdesigner">
  <AutoRefresh>0</AutoRefresh>
  <DataSources>
    <DataSource Name="DataSource">
      <rd:SecurityType>Integrated</rd:SecurityType>
      <ConnectionProperties>
        <DataProvider>ENTERDATA</DataProvider>
        <ConnectString />
        <IntegratedSecurity>true</IntegratedSecurity>
      </ConnectionProperties>
      <rd:DataSourceID>d14c9c4f-2b77-4b1c-b226-eda92723379b</rd:DataSourceID>
    </DataSource>
  </DataSources>
  <DataSets>
    <DataSet Name="InvoiceDataset">
      <Query>
        <DataSourceName>DataSource</DataSourceName>
        <CommandText />
      </Query>
      <Fields>
        <Field Name="InvoiceNo">
          <DataField>InvoiceNo</DataField>
        </Field>
        <Field Name="InvoiceDate">
          <DataField>InvoiceDate</DataField>
        </Field>
        <Field Name="CustomerName">
          <DataField>CustomerName</DataField>
        </Field>
        <Field Name="Description">
          <DataField>Description</DataField>
        </Field>
        <Field Name="Quantity">
          <DataField>Quantity</DataField>
        </Field>
        <Field Name="UnitPrice">
          <DataField>UnitPrice</DataField>
        </Field>
        <Field Name="LineAmount">
          <DataField>LineAmount</DataField>
        </Field>
        <Field Name="Subtotal">
          <DataField>Subtotal</DataField>
        </Field>
        <Field Name="Tax">
          <DataField>Tax</DataField>
        </Field>
        <Field Name="GrandTotal">
          <DataField>GrandTotal</DataField>
        </Field>
      </Fields>
    </DataSet>
  </DataSets>
  <ReportSections>
    <ReportSection>
      <Body>
        <Height>0cm</Height>
        <ReportItems>
          <Rectangle Name="CorpHeaderBox">
            <ReportItems>
              <Textbox Name="CorpCompanyName">
                <Paragraphs>
                  <Paragraph>
                    <TextRuns>
                      <TextRun>
                        <Value>{COMPANY_NAME}</Value>
                        <Style>
                          <FontFamily>Segoe UI</FontFamily>
                          <FontSize>22pt</FontSize>
                          <FontWeight>Bold</FontWeight>
                          <Color>#FFFFFF</Color>
                          <TextDecoration>None</TextDecoration>
                        </Style>
                      </TextRun>
                    </TextRuns>
                  </Paragraph>
                </Paragraphs>
                <Style>
                  <FontFamily>Segoe UI</FontFamily>
                  <FontSize>22pt</FontSize>
                  <FontWeight>Bold</FontWeight>
                  <Color>#FFFFFF</Color>
                  <TextDecoration>None</TextDecoration>
                </Style>
                <Top>12mm</Top>
                <Left>15mm</Left>
                <Width>120mm</Width>
                <Height>14mm</Height>
                <CanGrow>false</CanGrow>
                <CanShrink>false</CanShrink>
              </Textbox>
              <Textbox Name="CorpAddress">
                <Paragraphs>
                  <Paragraph>
                    <TextRuns>
                      <TextRun>
                        <Value>{COMPANY_ADDRESS}</Value>
                        <Style>
                          <FontFamily>Segoe UI</FontFamily>
                          <FontSize>9pt</FontSize>
                          <Color>#FFFFFF</Color>
                        </Style>
                      </TextRun>
                    </TextRuns>
                  </Paragraph>
                </Paragraphs>
                <Style>
                  <FontFamily>Segoe UI</FontFamily>
                  <FontSize>9pt</FontSize>
                  <Color>#FFFFFF</Color>
                </Style>
                <Top>28mm</Top>
                <Left>15mm</Left>
                <Width>120mm</Width>
                <Height>8mm</Height>
                <CanGrow>false</CanGrow>
                <CanShrink>false</CanShrink>
              </Textbox>
            </ReportItems>
            <Style>
              <BackgroundColor>#1F2937</BackgroundColor>
              <TopBorder>
                <Style>None</Style>
                <Width>0.25pt</Width>
                <Color>#1F2937</Color>
              </TopBorder>
              <BottomBorder>
                <Style>None</Style>
                <Width>0.25pt</Width>
                <Color>#1F2937</Color>
              </BottomBorder>
              <LeftBorder>
                <Style>None</Style>
                <Width>0.25pt</Width>
                <Color>#1F2937</Color>
              </LeftBorder>
              <RightBorder>
                <Style>None</Style>
                <Width>0.25pt</Width>
                <Color>#1F2937</Color>
              </RightBorder>
            </Style>
            <Top>0mm</Top>
            <Left>0mm</Left>
            <Width>210mm</Width>
            <Height>42mm</Height>
          </Rectangle>
          <Line Name="DividerLine">
            <Style>
              <Color>#E5E7EB</Color>
            </Style>
            <Top>45mm</Top>
            <Left>0mm</Left>
            <Width>210mm</Width>
            <Height>0mm</Height>
          </Line>
          <Textbox Name="CorpInvoiceTitle">
            <Paragraphs>
              <Paragraph>
                <TextRuns>
                  <TextRun>
                    <Value>{INVOICE_TITLE}</Value>
                    <Style>
                      <FontFamily>Segoe UI</FontFamily>
                      <FontSize>18pt</FontSize>
                      <FontWeight>Bold</FontWeight>
                      <Color>#1F2937</Color>
                    </Style>
                  </TextRun>
                </TextRuns>
              </Paragraph>
            </Paragraphs>
            <Style>
              <FontFamily>Segoe UI</FontFamily>
              <FontSize>18pt</FontSize>
              <FontWeight>Bold</FontWeight>
              <Color>#1F2937</Color>
            </Style>
            <Top>50mm</Top>
            <Left>15mm</Left>
            <Width>80mm</Width>
            <Height>10mm</Height>
            <CanGrow>false</CanGrow>
            <CanShrink>false</CanShrink>
          </Textbox>
          <Textbox Name="CorpInvoiceNoLabel">
            <Paragraphs>
              <Paragraph>
                <TextRuns>
                  <TextRun>
                    <Value>Invoice No:</Value>
                    <Style>
                      <FontFamily>Segoe UI</FontFamily>
                      <FontSize>9pt</FontSize>
                      <FontWeight>Bold</FontWeight>
                      <Color>#6B7280</Color>
                    </Style>
                  </TextRun>
                </TextRuns>
              </Paragraph>
            </Paragraphs>
            <Style>
              <FontFamily>Segoe UI</FontFamily>
              <FontSize>9pt</FontSize>
              <FontWeight>Bold</FontWeight>
              <Color>#6B7280</Color>
            </Style>
            <Top>50mm</Top>
            <Left>140mm</Left>
            <Width>25mm</Width>
            <Height>5mm</Height>
            <CanGrow>false</CanGrow>
            <CanShrink>false</CanShrink>
          </Textbox>
          <Textbox Name="CorpInvoiceNo">
            <Paragraphs>
              <Paragraph>
                <TextRuns>
                  <TextRun>
                    <Value>{INVOICE_NUMBER}</Value>
                    <Style>
                      <FontFamily>Segoe UI</FontFamily>
                      <FontSize>9pt</FontSize>
                    </Style>
                  </TextRun>
                </TextRuns>
              </Paragraph>
            </Paragraphs>
            <Style>
              <FontFamily>Segoe UI</FontFamily>
              <FontSize>9pt</FontSize>
            </Style>
            <Top>50mm</Top>
            <Left>165mm</Left>
            <Width>30mm</Width>
            <Height>5mm</Height>
            <CanGrow>false</CanGrow>
            <CanShrink>false</CanShrink>
          </Textbox>
          <Textbox Name="CorpInvoiceDateLabel">
            <Paragraphs>
              <Paragraph>
                <TextRuns>
                  <TextRun>
                    <Value>Date:</Value>
                    <Style>
                      <FontFamily>Segoe UI</FontFamily>
                      <FontSize>9pt</FontSize>
                      <FontWeight>Bold</FontWeight>
                      <Color>#6B7280</Color>
                    </Style>
                  </TextRun>
                </TextRuns>
              </Paragraph>
            </Paragraphs>
            <Style>
              <FontFamily>Segoe UI</FontFamily>
              <FontSize>9pt</FontSize>
              <FontWeight>Bold</FontWeight>
              <Color>#6B7280</Color>
            </Style>
            <Top>56mm</Top>
            <Left>140mm</Left>
            <Width>25mm</Width>
            <Height>5mm</Height>
          </Textbox>
          <Textbox Name="CorpInvoiceDate">
            <Paragraphs>
              <Paragraph>
                <TextRuns>
                  <TextRun>
                    <Value>{INVOICE_DATE}</Value>
                    <Style>
                      <FontFamily>Segoe UI</FontFamily>
                      <FontSize>9pt</FontSize>
                    </Style>
                  </TextRun>
                </TextRuns>
              </Paragraph>
            </Paragraphs>
            <Style>
              <FontFamily>Segoe UI</FontFamily>
              <FontSize>9pt</FontSize>
            </Style>
            <Top>56mm</Top>
            <Left>165mm</Left>
            <Width>30mm</Width>
            <Height>5mm</Height>
            <CanGrow>false</CanGrow>
            <CanShrink>false</CanShrink>
          </Textbox>
          <Textbox Name="CorpDueDateLabel">
            <Paragraphs>
              <Paragraph>
                <TextRuns>
                  <TextRun>
                    <Value>Due:</Value>
                    <Style>
                      <FontFamily>Segoe UI</FontFamily>
                      <FontSize>8pt</FontSize>
                      <FontWeight>Bold</FontWeight>
                      <Color>#6B7280</Color>
                    </Style>
                  </TextRun>
                </TextRuns>
              </Paragraph>
            </Paragraphs>
            <Style>
              <FontFamily>Segoe UI</FontFamily>
              <FontSize>8pt</FontSize>
              <FontWeight>Bold</FontWeight>
              <Color>#6B7280</Color>
            </Style>
            <Top>62mm</Top>
            <Left>140mm</Left>
            <Width>25mm</Width>
            <Height>5mm</Height>
            <CanGrow>false</CanGrow>
            <CanShrink>false</CanShrink>
          </Textbox>
          <Textbox Name="CorpDueDate">
            <Paragraphs>
              <Paragraph>
                <TextRuns>
                  <TextRun>
                    <Value>{DUE_DATE}</Value>
                    <Style>
                      <FontFamily>Segoe UI</FontFamily>
                      <FontSize>8pt</FontSize>
                    </Style>
                  </TextRun>
                </TextRuns>
              </Paragraph>
            </Paragraphs>
            <Style>
              <FontFamily>Segoe UI</FontFamily>
              <FontSize>8pt</FontSize>
            </Style>
            <Top>62mm</Top>
            <Left>165mm</Left>
            <Width>30mm</Width>
            <Height>5mm</Height>
            <CanGrow>false</CanGrow>
            <CanShrink>false</CanShrink>
          </Textbox>
          <!-- Bill From & Bill To grid similar to Modern layout -->
          <Rectangle Name="CorpBillFromBox">
            <ReportItems>
              <Textbox Name="CorpBillFromLabel">
                <Paragraphs>
                  <Paragraph>
                    <TextRuns>
                      <TextRun>
                        <Value>BILL FROM</Value>
                        <Style>
                          <FontFamily>Segoe UI</FontFamily>
                          <FontSize>9pt</FontSize>
                          <FontWeight>Bold</FontWeight>
                          <Color>#6b7280</Color>
                        </Style>
                      </TextRun>
                    </TextRuns>
                  </Paragraph>
                </Paragraphs>
                <Style>
                  <FontFamily>Segoe UI</FontFamily>
                  <FontSize>9pt</FontSize>
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
              <Textbox Name="CorpBillFromName">
                <Paragraphs>
                  <Paragraph>
                    <TextRuns>
                      <TextRun>
                        <Value>{COMPANY_NAME}</Value>
                        <Style>
                          <FontFamily>Segoe UI</FontFamily>
                          <FontSize>11pt</FontSize>
                          <FontWeight>Bold</FontWeight>
                          <Color>#1f2937</Color>
                        </Style>
                      </TextRun>
                    </TextRuns>
                  </Paragraph>
                </Paragraphs>
                <Style>
                  <FontFamily>Segoe UI</FontFamily>
                  <FontSize>11pt</FontSize>
                  <FontWeight>Bold</FontWeight>
                  <Color>#1f2937</Color>
                </Style>
                <Top>12mm</Top>
                <Left>5.29mm</Left>
                <Width>80mm</Width>
                <Height>6mm</Height>
                <CanGrow>false</CanGrow>
                <CanShrink>false</CanShrink>
              </Textbox>
              <Textbox Name="CorpBillFromAddress">
                <Paragraphs>
                  <Paragraph>
                    <TextRuns>
                      <TextRun>
                        <Value>{COMPANY_ADDRESS}</Value>
                        <Style>
                          <FontFamily>Segoe UI</FontFamily>
                          <FontSize>10pt</FontSize>
                          <Color>#1f2937</Color>
                        </Style>
                      </TextRun>
                    </TextRuns>
                  </Paragraph>
                </Paragraphs>
                <Style>
                  <FontFamily>Segoe UI</FontFamily>
                  <FontSize>10pt</FontSize>
                  <Color>#1f2937</Color>
                </Style>
                <Top>18mm</Top>
                <Left>5.29mm</Left>
                <Width>80mm</Width>
                <Height>12mm</Height>
                <CanGrow>false</CanGrow>
                <CanShrink>false</CanShrink>
              </Textbox>
            </ReportItems>
            <Style>
              <BackgroundColor>#f9fafb</BackgroundColor>
              <LeftBorder>
                <Style>Solid</Style>
                <Width>1.06mm</Width>
                <Color>#3b82f6</Color>
              </LeftBorder>
            </Style>
            <Top>70mm</Top>
            <Left>15mm</Left>
            <Width>85mm</Width>
            <Height>35mm</Height>
          </Rectangle>

          <Rectangle Name="CorpBillToBox">
            <ReportItems>
              <Textbox Name="CorpBillToLabel">
                <Paragraphs>
                  <Paragraph>
                    <TextRuns>
                      <TextRun>
                        <Value>BILL TO</Value>
                        <Style>
                          <FontFamily>Segoe UI</FontFamily>
                          <FontSize>9pt</FontSize>
                          <FontWeight>Bold</FontWeight>
                          <Color>#6b7280</Color>
                        </Style>
                      </TextRun>
                    </TextRuns>
                  </Paragraph>
                </Paragraphs>
                <Style>
                  <FontFamily>Segoe UI</FontFamily>
                  <FontSize>9pt</FontSize>
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
              <Textbox Name="CorpBillToName">
                <Paragraphs>
                  <Paragraph>
                    <TextRuns>
                      <TextRun>
                        <Value>{CUSTOMER_NAME}</Value>
                        <Style>
                          <FontFamily>Segoe UI</FontFamily>
                          <FontSize>11pt</FontSize>
                          <FontWeight>Bold</FontWeight>
                          <Color>#1f2937</Color>
                        </Style>
                      </TextRun>
                    </TextRuns>
                  </Paragraph>
                </Paragraphs>
                <Style>
                  <FontFamily>Segoe UI</FontFamily>
                  <FontSize>11pt</FontSize>
                  <FontWeight>Bold</FontWeight>
                  <Color>#1f2937</Color>
                </Style>
                <Top>12mm</Top>
                <Left>5.29mm</Left>
                <Width>80mm</Width>
                <Height>6mm</Height>
                <CanGrow>false</CanGrow>
                <CanShrink>false</CanShrink>
              </Textbox>
              <Textbox Name="CorpBillToAddress">
                <Paragraphs>
                  <Paragraph>
                    <TextRuns>
                      <TextRun>
                        <Value>{CUSTOMER_ADDRESS}</Value>
                        <Style>
                          <FontFamily>Segoe UI</FontFamily>
                          <FontSize>10pt</FontSize>
                          <Color>#1f2937</Color>
                        </Style>
                      </TextRun>
                    </TextRuns>
                  </Paragraph>
                </Paragraphs>
                <Style>
                  <FontFamily>Segoe UI</FontFamily>
                  <FontSize>10pt</FontSize>
                  <Color>#1f2937</Color>
                </Style>
                <Top>18mm</Top>
                <Left>5.29mm</Left>
                <Width>80mm</Width>
                <Height>12mm</Height>
                <CanGrow>false</CanGrow>
                <CanShrink>false</CanShrink>
              </Textbox>
            </ReportItems>
            <Style>
              <BackgroundColor>#f9fafb</BackgroundColor>
              <LeftBorder>
                <Style>Solid</Style>
                <Width>1.06mm</Width>
                <Color>#3b82f6</Color>
              </LeftBorder>
            </Style>
            <Top>70mm</Top>
            <Left>115mm</Left>
            <Width>85mm</Width>
            <Height>35mm</Height>
          </Rectangle>

          {ITEM_TABLE_XML}
          {TOTALS_SECTION}
        </ReportItems>
      </Body>
      <Width>21cm</Width>
      <Page>
        <PageHeader>
          <Height>0cm</Height>
        </PageHeader>
        <PageFooter>
          <Height>0cm</Height>
        </PageFooter>
        <Columns>1</Columns>
      </Page>
    </ReportSection>
  </ReportSections>
</Report>`

export function getTemplate(templateId: string): string {
  switch (templateId) {
    case "simple":
      return SIMPLE_INVOICE_TEMPLATE
    case "modern":
      return MODERN_INVOICE_TEMPLATE
    case "corporate":
      return CORPORATE_INVOICE_TEMPLATE
    default:
      return SIMPLE_INVOICE_TEMPLATE
  }
}

export function getTemplateMetadata(templateId: string) {
  const templates: Record<string, any> = {
    simple: {
      id: "simple",
      name: "Simple Invoice",
      description: "Clean and minimal invoice layout with essential fields",
      category: "Basic",
      preview: "Simple layout ideal for small businesses",
    },
    modern: {
      id: "modern",
      name: "Modern Invoice",
      description: "Professional invoice with enhanced styling and blue header",
      category: "Professional",
      preview: "Modern design with branded header",
    },
    corporate: {
      id: "corporate",
      name: "Corporate Invoice",
      description: "Enterprise-grade invoice with dark header and premium styling",
      category: "Enterprise",
      preview: "Corporate design for large organizations",
    },
  }
  return templates[templateId] || templates.simple
}
