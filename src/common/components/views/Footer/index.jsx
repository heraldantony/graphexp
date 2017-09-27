import React, {Component} from 'react'
import PropTypes from 'prop-types'

export default class Footer extends Component {
	shouldComponentUpdate (nextProps) {
		return !isEqual(nextProps, this.props)
	}

	static propTypes = {
		}

	render () {
    const {props} = this.props

		return (

			<div className="footer">
				<div className="container">
					<a href="http://www.github.com/bricaud/graphexp">Graph Explorer V 0.6</a>
				</div>
			</div>

		)
	}
}
