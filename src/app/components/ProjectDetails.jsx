import React from 'react'
import { Alert, Heading, Pane } from 'evergreen-ui'

import Tasks from './Tasks'
import Semantics from '../utils/semantics'
import SemanticComponentBuilder from '../../library/services/SemanticComponentBuilder'
import { useAppContextState } from '../context/AppContext'
import GenericActionInDialog from '../../library/components/GenericActionInDialog'

const ProjectDetails = ({ title, semanticData }) => {
  const { apiDocumentation } = useAppContextState()

  const [ listTasksLabel, listTasksOperation ] = semanticData.getRelation(Semantics.vnd_jeera.relations.listProjectTasks, apiDocumentation)
  const otherOperations = semanticData.getOtherRelations(apiDocumentation)

  return <>
    <Pane display="flex" flexDirection="row" justifyContent="space-between" width="100%" overflow="hidden">
      <Pane><Heading size={900}>{title}</Heading></Pane>
      <Pane flexDirection="column"><Operations operations={otherOperations}/></Pane>
    </Pane>
    <Tasks listTasksOperation={listTasksOperation}/>
  </>
}

const Operations = ({operations}) => operations.map(operation =>
  <GenericActionInDialog label={operation[0]} key={operation[0]} alwaysShown={false} operation={operation[1]} buttonAppearance="default" />
)

export const ProjectDetailsSemantic = new SemanticComponentBuilder(
  Semantics.schema.terms.Project,
  ProjectDetails,
  {
    id: Semantics.vnd_jeera.terms.projectId,
    title: Semantics.schema.terms.name,
    collaborators: Semantics.vnd_jeera.terms.collaborators,
  },
  {
    isPublic: Semantics.vnd_jeera.terms.isPublic,
    lastUpdate: Semantics.schema.terms.lastUpdate
  },
  undefined,
  errorHandler
).build();

function errorHandler (e) {
  console.error(e);
  if (e.missingData) {
    return <Alert
      intent="danger"
      title={`Unable to display project, required data are missing: ${e.missingData}`}
    />
  }
}

export default ProjectDetails