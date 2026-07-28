# SSRS 2016 RDL Schema Requirements

This document outlines the key differences and requirements for SSRS 2016 RDL format that we've discovered and fixed in this project.

## 1. Report Structure

### ReportSections Required
SSRS 2016 requires `Body` to be wrapped in `ReportSections` and `ReportSection`:

```xml
<Report>
  <DataSources>...</DataSources>
  <DataSets>...</DataSets>
  <EmbeddedImages>...</EmbeddedImages>  <!-- If using logos -->
  <ReportSections>
    <ReportSection>
      <Body>
        <Height>0cm</Height>  <!-- Required: Body must have Height property -->
        <ReportItems>...</ReportItems>
      </Body>
      <Width>21cm</Width>  <!-- ReportSection can have Width, but NOT Height -->
      <Page>...</Page>
    </ReportSection>
  </ReportSections>
</Report>
```

**NOT:**
```xml
<Report>
  <Body>...</Body>  <!-- ❌ Invalid -->
  <Width>...</Width>  <!-- ❌ Must be inside ReportSection -->
</Report>
```

## 2. Textbox Structure

### Paragraphs Required
SSRS 2016 requires `Value` to be inside `Paragraphs` > `Paragraph` > `TextRuns` > `TextRun`:

```xml
<Textbox Name="...">
  <Paragraphs>
    <Paragraph>
      <TextRuns>
        <TextRun>
          <Value>...</Value>
          <Style>
            <!-- Font properties: FontSize, FontWeight, Color -->
          </Style>
        </TextRun>
      </TextRuns>
    </Paragraph>
  </Paragraphs>
  <Style>
    <!-- Layout properties: Border, BackgroundColor, Padding, TextAlign -->
  </Style>
  <Top>...</Top>
  <Left>...</Left>
  <Width>...</Width>
  <Height>...</Height>
</Textbox>
```

**NOT:**
```xml
<Textbox Name="...">
  <Value>...</Value>  <!-- ❌ Invalid -->
  <Style>...</Style>
</Textbox>
```

## 3. Color Format

### Hash Prefix Required
All color values must include the `#` prefix:

```xml
<Color>#FFFFFF</Color>  <!-- ✅ Correct -->
<Color>#1F2937</Color>  <!-- ✅ Correct -->
```

**NOT:**
```xml
<Color>FFFFFF</Color>  <!-- ❌ Invalid -->
```

## 4. Border Format

### Individual Border Elements Required
SSRS 2016 requires individual border elements instead of `BorderStyle`, `BorderWidth`, `BorderColor`:

```xml
<Style>
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
</Style>
```

**NOT:**
```xml
<Style>
  <BorderStyle>
    <Default>Solid</Default>  <!-- ❌ Invalid -->
  </BorderStyle>
  <BorderWidth>
    <Default>1pt</Default>  <!-- ❌ Invalid -->
  </BorderWidth>
  <BorderColor>
    <Default>#1e293b</Default>  <!-- ❌ Invalid -->
  </BorderColor>
</Style>
```

## 5. Line Element Format

### Color Property Only
For `Line` elements in SSRS 2016, only `Color` is supported in `Style`. `LineWidth` is not a valid property:

```xml
<Line Name="DividerLine">
  <Style>
    <Color>#E5E7EB</Color>
  </Style>
  <Top>45mm</Top>
  <Left>0mm</Left>
  <Width>210mm</Width>
  <Height>0mm</Height>
</Line>
```

**NOT:**
```xml
<Line Name="DividerLine">
  <Style>
    <LineColor>#E5E7EB</LineColor>  <!-- ❌ Invalid -->
    <LineWidth>2pt</LineWidth>  <!-- ❌ Invalid -->
  </Style>
  <LineWidth>2pt</LineWidth>  <!-- ❌ Invalid - not a valid child element -->
</Line>
```

**Note:** Line thickness/width is not directly controllable in SSRS 2016 RDL. The line will render with a default thickness.

## 6. Tablix Structure

### Complete Tablix Structure
SSRS 2016 requires `Tablix` to have both `TablixBody` (with `TablixColumns` and `TablixRows`) AND `TablixRowHierarchy` and `TablixColumnHierarchy` as direct children:

```xml
<Tablix Name="ItemsTable">
  <TablixBody>
    <TablixColumns>
      <TablixColumn>
        <Width>45mm</Width>
      </TablixColumn>
      <!-- more columns -->
    </TablixColumns>
    <TablixRows>
      <TablixRow>
        <Height>12mm</Height>
        <TablixCells>
          <!-- header cells -->
        </TablixCells>
      </TablixRow>
      <TablixRow>
        <Height>10mm</Height>
        <TablixCells>
          <!-- data cells -->
        </TablixCells>
      </TablixRow>
    </TablixRows>
  </TablixBody>
  <TablixRowHierarchy>
    <TablixMembers>
      <TablixMember>
        <Group Name="Details" />
      </TablixMember>
    </TablixMembers>
  </TablixRowHierarchy>
  <TablixColumnHierarchy>
    <TablixMembers>
      <TablixMember />
      <!-- one per column -->
    </TablixMembers>
  </TablixColumnHierarchy>
  <Top>85mm</Top>
  <Left>10mm</Left>
  <Width>180mm</Width>
  <Height>60mm</Height>
</Tablix>
```

**Key Points:**
- `TablixBody` contains `TablixColumns` and `TablixRows` (NOT hierarchies)
- `TablixRowHierarchy` and `TablixColumnHierarchy` are direct children of `Tablix` (NOT inside `TablixBody`)
- Both are required for a valid Tablix structure

### TablixCells Wrapper Required
`TablixCell` elements must be wrapped in `TablixCells` (plural) within each `TablixRow`:

```xml
<TablixRow>
  <Height>12mm</Height>
  <TablixCells>
    <TablixCell>...</TablixCell>
    <TablixCell>...</TablixCell>
  </TablixCells>
</TablixRow>
```

**NOT:**
```xml
<TablixRow>
  <Height>12mm</Height>
  <TablixCell>...</TablixCell>  <!-- ❌ Invalid - must be in TablixCells -->
  <TablixCell>...</TablixCell>
</TablixRow>
```

## 7. EmbeddedImages Placement

### Must be at Report Level
`EmbeddedImages` must be a direct child of `<Report>`, before `<ReportSections>`:

```xml
<Report>
  <DataSources>...</DataSources>
  <DataSets>...</DataSets>
  <EmbeddedImages>
    <EmbeddedImage Name="CompanyLogo">
      <MIMEType>image/png</MIMEType>
      <ImageData>...</ImageData>
    </EmbeddedImage>
  </EmbeddedImages>
  <ReportSections>...</ReportSections>
</Report>
```

## Summary of Fixes Applied

1. ✅ Wrapped all `Body` elements in `ReportSections` > `ReportSection`
2. ✅ Moved `Width`, `Height`, and `Page` inside `ReportSection`
3. ✅ Converted all `Textbox` elements to use `Paragraphs` structure
4. ✅ Fixed all color values to include `#` prefix
5. ✅ Converted all borders to use `TopBorder`, `BottomBorder`, `LeftBorder`, `RightBorder`
6. ✅ Moved `EmbeddedImages` to report level (before `ReportSections`)

## Files Modified

- `lib/templates.tsx` - All three templates (Simple, Modern, Corporate)
- `lib/rdl-builders.tsx` - Item tables, totals sections
- `lib/rdl-generator.tsx` - Logo embedding logic

## Testing

After these fixes, the generated RDL files should:
- ✅ Load successfully in Report Builder
- ✅ Validate against SSRS 2016 schema
- ✅ Render correctly in SSRS 2016

