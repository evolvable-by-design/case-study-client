import React from 'react';
import { Icon, Pane, Paragraph, SelectField, TextInputField, Tooltip, majorScale } from 'evergreen-ui';

import ajv from '../services/Ajv';
import SwitchInputField from '../../app/components/SwitchInputField';
import { stateSetter } from '../../app/utils/javascriptUtils';

export function genericFilters({parameters, values, setValues, errors, setErrors}) {
  return parameters.length === 0
    ? <></>
    : <Pane width="100%" display="flex" flexDirection="row" flexWrap="wrap" alignItems="flex-start" justifyContent="flex-start">
        {
          parameters.map(param =>
            <Pane display="flex" height="100%" key={param.name} marginRight={majorScale(3)} >
              <SelectInput
                parameter={param}
                value={values[param.name]}
                setValue={stateSetter(setValues, param.name)}
                error={errors[param.name]}
                setError={stateSetter(setErrors, param.name)}
              />
            </Pane>)
        }
      </Pane>;
};

function SelectInput({parameter, value, setValue, error, setError}) {
  // TODO: resolve and use type from the semantic description
  const labelText = parameter.name.charAt(0).toUpperCase() + parameter.name.slice(1);
  const label = <Tooltip content={parameter.description}><Paragraph width="100%"><Icon size={11} icon="info-sign" /> {labelText}</Paragraph></Tooltip>;
  const onChange = (val) => {
    const [value, error] = _validateValue(val, parameter.schema);
    setError(error);
    setValue(value);
  }

  if (parameter.schema.type === 'boolean') {
    return <SwitchInputField label={label} checked={value} onChange={onChange}/>
  } else if (parameter.schema.type === 'string' && parameter.schema.enum !== undefined) {
    return <Pane width={majorScale(24)}>
      <SelectField 
        label={label}
        isInvalid={error !== undefined}
        value={value}
        required={parameter.required}
        placeholder={'Please select an option...'}
        validationMessage={error}
        width="100%"
        onChange={e => onChange(e.target.value)}
      >
        { parameter.schema.enum.map(option => <option value="option" selected={parameter.schema.default === option} >{option}</option>) }
      </SelectField>
    </Pane>
  } else {
    return <Pane width={majorScale(24)}>
      <TextInputField 
        label={label}
        isInvalid={error !== undefined}
        value={value}
        required={parameter.required}
        placeholder={parameter.schema.format}
        validationMessage={error}
        width="100%"
        onChange={e => onChange(e.target.value)}
      />
    </Pane>
  }
}

function _validateValue(value, schema) {
  const val = schema.type === 'number' ? parseFloat(value, 10) || ''
    : schema.type === 'integer' ? parseInt(value, 10) || ''
    : value;
  const validate = ajv.compile(schema);
  const valid = validate(val);
  
  return [val, valid ? undefined : ajv.errorsText(validate.errors)];
}

export default genericFilters