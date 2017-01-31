import React from 'react'
import {List, ListItem} from 'material-ui/List'
import Divider from 'material-ui/Divider'
import Clear from 'material-ui/svg-icons/content/clear'
import IconButton from 'material-ui/IconButton'
import Paper from 'material-ui/Paper'
import RaisedButton from 'material-ui/RaisedButton'


const ListComponent = (props) => {

const styles = {
	root: {
		display: 'flex',
		justifyContent: 'center',
		flexWrap: 'wrap',
		padding: 20,
		margin: '0 auto'
	},
	container: {
		textAlign: 'center',
		paddingTop: 10,
		minWidth: '25%',
		position: 'relative',
	}
}

const deleteButton = index => (
	<IconButton onClick={(event) => props.onDelete(index, event)}>
		<Clear />
	</IconButton>
)

return(
	<div>
	{props.items.length > 0 &&
	<div style={styles.root}>
	<div style={{padding: 10}}>
	<RaisedButton label="subscribe" primary={true} 
		onClick={(e) => props.onSubscribe(e)}
	/>
	</div>
	<Paper style={styles.container}>
	<List>
		{props.items.map((currentValue, index) => (
			<div key={index}>
			{index > 0 &&
				<Divider />
			}
			<ListItem 
				primaryText={currentValue} 
				rightIconButton={deleteButton(index)}
			/>
			</div>
		))}
	</List>
	</Paper>
	</div>
	}
	</div>
)
}

export default ListComponent