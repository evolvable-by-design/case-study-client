import { useState, useCallback, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import { useAppContextState } from '../context/AppContext'
import { useFetchWithContext } from '../hooks/useFetch'; 
import { useFiltersToRender, useFormToRender } from './componentsGenerationHooks';
import { useRequestBodySchema } from '../hooks/documentationHooks';
import { buildRequest, inputParamValueOrDefault, inputBodyValueOrDefault } from '../utils/requestBuilder';
import { AuthenticationRequiredError } from '../utils/Errors';

function useGenericOperationResolver(actionKey, operation, onSuccessCallback, onErrorCallback) {
  const { apiDocumentation } = useAppContextState();
  const history = useHistory();

  const foundOperation = useMemo(() => {
    try {
      return operation || apiDocumentation.findOperation(actionKey)
    } catch (error) {
      if (error instanceof AuthenticationRequiredError) {
        console.log('Redirecting to login')
        history.push('/login')
      }
      return undefined
    }
  }, [actionKey, operation, apiDocumentation, history]);
  
  return useGenericOperationResolverOperation(foundOperation, onSuccessCallback, onErrorCallback);
}

export function useGenericOperationResolverOperation(operation, onSuccessCallback, onErrorCallback) {
  const { apiDocumentation } = useAppContextState();
  const requestBodySchema = useRequestBodySchema(apiDocumentation, operation);

  const defaultParametersState = useMemo(() => inputParamValueOrDefault(operation, {}), [operation]);
  const [ parameters, setParameters ] = useState(defaultParametersState);
  const [ parameterErrors, setParamaterErrors ] = useState({});
  const filtersToDisplay = useFiltersToRender(operation, parameters, setParameters, parameterErrors, setParamaterErrors);

  const defaultFormState = useMemo(() => inputBodyValueOrDefault(requestBodySchema, {}), [requestBodySchema]);
  const [ form, setForm ] = useState(defaultFormState);
  const [ formErrors, setFormErrors ] = useState({});
  const formToDisplay = useFormToRender(operation, requestBodySchema, form, setForm, formErrors, setFormErrors);

  const defaultRequest = useMemo(
    () => buildDefaultRequest(apiDocumentation, operation, requestBodySchema),
    [apiDocumentation, operation, requestBodySchema]
  );
  const [request, setRequest] = useState(defaultRequest);

  const [shouldRecomputeRequest, setShouldRecomputeRequest] = useState(true);

  const triggerCall = useCallback(() => setShouldRecomputeRequest(true), [])

  if (shouldRecomputeRequest) {
    setShouldRecomputeRequest(false);
    const request = buildRequest(apiDocumentation, operation, requestBodySchema, parameters, form);
    setRequest(request)
  }

  const [ semanticData, isLoading, error ] = useFetchWithContext(request, operation, undefined, onSuccessCallback, onErrorCallback);

  return operation === undefined
    ? [ undefined, undefined, 'Operation not found', undefined, undefined, undefined, undefined ]
    : [ semanticData, isLoading, error, triggerCall, filtersToDisplay, formToDisplay, operation ];
}

function buildDefaultRequest(apiDocumentation, operation, requestBodySchema) {
  return operation && operation.verb === 'get'
    ? buildRequest(apiDocumentation, operation, requestBodySchema, {}, {})
    : undefined;
}

export default useGenericOperationResolver;
