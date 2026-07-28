import { TemplateEditor } from "./TemplateEditor"

export default async function TemplateEditPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  return <TemplateEditor templateId={id} />
}


