import React, {Component} from 'react'
import PropTypes from 'prop-types'

export default class GraphComponent extends Component {
	static propTypes = {
		get_graph_info: PropTypes.func,
    show_hide_element: PropTypes.func
	}

	render () {
		const {get_graph_info, show_hide_element} = this.props

		return (
			<div className="content">
					<div className="main" id="main">
						<svg></svg>
					</div>

					<div className="aside left_bar" style={{backgroundColor:"transparent",pointerEvents:"none"}}>
						<div  id="graphInfoBar" style={{backgroundColor:"transparent",pointerEvents:"auto"}}>
							<button name="graphInfo" onClick={get_graph_info}>Get graph info</button>
							<input type="checkbox" name="showgraphinfo" id="showgraphinfo" onChange={show_hide_element}/>Show/hide graph info
						</div>
						<div  id="graphInfo" style={{backgroundColor:"transparent",pointerEvents:"none"}}>
						</div>
					</div>

					<div className="aside right_bar" id="details" style={{backgroundColor:"transparent",pointerEvents:"none"}}>
						<div id="messageArea"></div><div id="outputArea"></div>
						<div id="nodeInfo" style={{backgroundColor:"transparent",pointerEvents:"none"}}>
						</div>
					</div>
			</div>
		)
	}
}
