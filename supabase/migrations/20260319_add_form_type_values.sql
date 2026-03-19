-- Add missing form_type values to the check constraint
ALTER TABLE form_submissions
  DROP CONSTRAINT form_submissions_form_type_check;

ALTER TABLE form_submissions
  ADD CONSTRAINT form_submissions_form_type_check
  CHECK (form_type IN (
    'insurance_relocation',
    'corporate_relocation',
    'government_lodging',
    'contact',
    'property_submission',
    'corporate_government_request',
    'housing_request'
  ));
