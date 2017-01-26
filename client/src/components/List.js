import React from 'react'
import {List, ListItem} from 'material-ui/List'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import DeleteForever from 'material-ui/svg-icons/action/delete-forever'

const ListComponent = (props) => (
	<MuiThemeProvider>
	<List>
		{props.items.map((currentValue, index) => (
			<ListItem 
				primaryText={currentValue} 
				rightIcon={<DeleteForever />}
				key={index}
			/>
		))}
	</List>
	</MuiThemeProvider>
)

export default ListComponent