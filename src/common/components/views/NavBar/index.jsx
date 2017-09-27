import React, {Component} from 'react'
import PropTypes from 'prop-types'

export default class NavBar extends Component {
	shouldComponentUpdate (nextProps) {
		return !isEqual(nextProps, this.props)
	}

	static propTypes = {
    search_query: PropTypes.func,
    clear_graph: PropTypes.func,
    show_names: PropTypes.func,
    set_nb_layers: PropTypes.func
		}

	render () {
    const {search_query, clear_graph, show_names, set_nb_layers} = this.props

		return (

      <div className="nav-bar">
			<div className="container" id="nav_bar">
				<ul className="nav">
					<li>
						Enter a field: <span id="prop_choice"><input name="search_field" id="search_field" value="" /></span>
					</li>
					<li>
						Enter a Keyword/value: <input name="search_value" id="search_value" value="" />
					</li>
					<li><button name="search query" onClick={search_query}>Search</button></li>
					<li><button name="clear" onClick={clear_graph}>Clear</button></li>
					<li><input type="checkbox" name="Freeze" id="freeze-in" />Freeze exploration</li>
					<li>
						<input type="checkbox" name="showName_box" id="showName" onClick={show_names}/>Show labels
					</li>
					<li><input type="number" id="nbLayers" min="1" max="128" onClick={set_nb_layers} /> Nb of layers.
					</li>
				</ul>
			</div>
		</div>

		)
	}
}
