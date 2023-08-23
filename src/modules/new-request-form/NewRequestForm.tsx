import type { RequestForm, TicketForm } from "./data-types";
import { Input } from "./fields/Input";
import { TextArea } from "./fields/TextArea";
import { DropDown } from "./fields/DropDown";
import { TicketFormField } from "./ticket-form-field/TicketFormField";
import { ParentTicketField } from "./parent-ticket-field/ParentTicketField";
import { Button } from "@zendeskgarden/react-buttons";
import styled from "styled-components";
import { Alert } from "@zendeskgarden/react-notifications";
import { useSubmitHandler } from "./useSubmitHandler";

export interface NewRequestFormProps {
  ticketForms: TicketForm[];
  requestForm: RequestForm;
  parentId: string;
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.space.md};
`;

const Footer = styled.div`
  margin-top: ${(props) => props.theme.space.md};
`;

export function NewRequestForm({
  ticketForms,
  requestForm,
  parentId,
}: NewRequestFormProps) {
  const {
    fields,
    action,
    http_method,
    accept_charset,
    errors,
    ticket_form_field,
    ticket_forms_instructions,
    parent_id_field,
  } = requestForm;
  const handleSubmit = useSubmitHandler();

  return (
    <Form
      action={action}
      method={http_method}
      acceptCharset={accept_charset}
      noValidate
      onSubmit={handleSubmit}
    >
      {errors && <Alert type="error">{errors}</Alert>}
      {parentId && <ParentTicketField field={parent_id_field} />}
      {ticketForms.length > 0 && (
        <TicketFormField
          label={ticket_forms_instructions}
          ticketFormField={ticket_form_field}
          ticketForms={ticketForms}
        />
      )}
      {fields.map((field) => {
        switch (field.type) {
          case "anonymous_requester_email":
          case "subject":
          case "text":
          case "integer":
          case "decimal":
          case "regexp":
          case "partialcreditcard":
            return <Input field={field} />;
          case "description":
          case "textarea":
            return <TextArea field={field} />;
          case "priority":
          case "organization_id":
          case "tickettype":
            return <DropDown field={field} />;
          case "checkbox":
            return <div>checkbox</div>;
          case "date":
            return <div>date</div>;
          case "multiselect":
            return <div>multiselect</div>;
          case "tagger":
            return <div>tagger</div>;
          default:
            return <></>;
        }
      })}
      <Footer>
        {(ticketForms.length === 0 || ticket_form_field.value) && (
          <Button isPrimary type="submit">
            Submit
          </Button>
        )}
      </Footer>
    </Form>
  );
}
