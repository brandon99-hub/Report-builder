// Helper function to convert old Textbox format to SSRS 2016 Paragraphs format
export function convertTextboxToParagraphs(textboxXml: string): string {
  // Replace <Value>...</Value> with Paragraphs structure
  return textboxXml.replace(
    /<Value>(.*?)<\/Value>/s,
    `<Paragraphs>
          <Paragraph>
            <TextRuns>
              <TextRun>
                <Value>$1</Value>
                <Style>
                  <FontSize>10pt</FontSize>
                </Style>
              </TextRun>
            </TextRuns>
          </Paragraph>
        </Paragraphs>`
  )
}

// Helper to build Textbox with Paragraphs structure for SSRS 2016
export function buildTextboxXml(
  name: string,
  value: string,
  textRunStyle: string,
  textboxStyle: string,
  position: { top: string; left: string; width: string; height: string }
): string {
  return `<Textbox Name="${name}">
        <Paragraphs>
          <Paragraph>
            <TextRuns>
              <TextRun>
                <Value>${value}</Value>
                <Style>
                  ${textRunStyle}
                </Style>
              </TextRun>
            </TextRuns>
          </Paragraph>
        </Paragraphs>
        <Style>
          ${textboxStyle}
        </Style>
        <Top>${position.top}</Top>
        <Left>${position.left}</Left>
        <Width>${position.width}</Width>
        <Height>${position.height}</Height>
      </Textbox>`
}

