import React, {Component} from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import GraphComponent from './components/GraphComponent'

export default class Dashboard extends Component {
	static propTypes = {
	}

	shouldComponentUpdate (nextProps) {
	}

	render () {
		const graphComponentProps = this.props

		return (
			<GraphComponent {...graphComponentProps}>
			</GraphComponent>

		)
	}
}
