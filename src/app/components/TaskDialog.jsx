import React from 'react'
import { useHistory } from 'react-router-dom'
import qs from 'qs'
import { Badge, Button, Dialog, Heading, Menu, Pane, Popover, Position, majorScale, minorScale } from 'evergreen-ui'

import SemanticComponentBuilder from '../../library/services/SemanticComponentBuilder'

import { defaultSemanticComponentErrorHandler } from '../utils/Errors'
import Semantics from '../utils/semantics'
import { Paragraph } from 'evergreen-ui/commonjs/typography'

const TaskDialog = ({ id, assignee, title, description, points, status, lastUpdate, semanticData }) => {
  const history = useHistory()
  const otherData = semanticData.getOtherData()
  const actions = semanticData.getOtherRelations()
  console.log(actions)

  return <Dialog
    isShown={true}
    title={title}
    onCloseComplete={() => hideTaskDialog(history)}
    width={Math.min(document.body.clientWidth*0.8, 1200)}
    maxHeight={document.body.clientHeight*0.8}
  >
    <Pane display="flex" flexDirection="row">
      <Pane flexGrow={10} display="flex" flexDirection="column" marginRight={majorScale(2)}>
        <Paragraph marginBottom={majorScale(1)}><Badge>{id}</Badge></Paragraph>
        <Heading size={500} marginBottom={majorScale(2)}>Description</Heading>
        <Paragraph>{description || 'Empty description'}</Paragraph>
      </Pane>
      <Pane flexGrow={1} minWidth="200px" display="flex" flexDirection="column">
        <TextWithLabel label='Assignee'>{assignee}</TextWithLabel>
        <TextWithLabel label='Points'>{points || 0}</TextWithLabel>
        <TextWithLabel label='Status'>{status}</TextWithLabel>
        <TextWithLabel label='Last update on'>{lastUpdate}</TextWithLabel>
        {
          Object.entries(otherData).map(([key, value]) => 
            <TextWithLabel label={key} key={key}>{JSON.stringify(value)}</TextWithLabel>
          )
        }
      </Pane>
    </Pane>
  </Dialog>
}
//<Actions actions={actions} />

const TextWithLabel = ({label, children}) => 
  <Pane marginBottom={majorScale(1)}>
    <Heading size={400} marginBottom={minorScale(1)}>{label}</Heading>
    <Paragraph>{children}</Paragraph>
  </Pane>

const Actions = ({actions}) => 
<Popover
position={Position.BOTTOM_LEFT}
content={
  <Menu>
    <Menu.Group>
      { actions.map(action => 
        <Menu.Item
          key={action}
          onSelect={() => alert('Share')}
        >
          Share...
        </Menu.Item>)
      }
    </Menu.Group>
  </Menu>
}>
<Button marginRight={16}>Actions</Button>
</Popover>

export const TaskDialogSemantic = new SemanticComponentBuilder(
  [ Semantics.schema.terms.Task, Semantics.schema.terms.TechnicalStory, Semantics.schema.terms.UserStory ],
  TaskDialog,
  {
    id: Semantics.vnd_jeera.terms.taskId,
    title: Semantics.schema.terms.name,
    assignee: Semantics.vnd_jeera.terms.assignee,
    status: Semantics.vnd_jeera.terms.TaskStatus,
    lastUpdate: Semantics.schema.terms.lastUpdate
  },
  {
    description: Semantics.vnd_jeera.terms.description,
    points: Semantics.vnd_jeera.terms.points
  },
  undefined,
  defaultSemanticComponentErrorHandler('task')
).build()

function hideTaskDialog(history) {
  const query = qs.parse(window.location.search.substring(1))
  delete query.taskFocus
  history.push(`${window.location.pathname}?${qs.stringify(query)}`)
}

export default TaskDialog