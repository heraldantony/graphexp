import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter, matchPath} from 'react-router'
import PropTypes from 'prop-types'
import {push} from 'react-router-redux'
// Import main views
import NavBar from 'components/views/NavBar'
import Footer from 'components/views/Footer'
import Dashboard from 'containers/Dashboard'
import { infobox, graph_viz, graphioGremlin, utils } from 'actions'
import * as graphShapes from 'actions/graph_shapes'
import * as conf from 'actions/conf'
import d3 from 'd3'
import $ from 'jquery'




class App extends Component {
	static propTypes = {
		// Routes of app passed as props in `Root`
		routes: PropTypes.array.isRequired,
		// React-router `withRouter` props
		location: PropTypes.object,
		history: PropTypes.object

		}

	// XXX: will be fixed one day.
	// shouldComponentUpdate(nextProps) {
	//     let {match, isMobile, isLoggedIn, sidebarOpened} = this.props
	//     let matchSame = _.isEqual(nextProps.match, match)
	//     let isMobileSame = _.isEqual(nextProps.isMobile, isMobile)
	//     let isLoggedInSame = _.isEqual(nextProps.isLoggedIn, isLoggedIn)
	//     let sidebarOpenedSame = _.isEqual(nextProps.sidebarOpened, sidebarOpened)
	//     // return props that can force us aren't the same
	//     return !(matchSame && isMobileSame && isLoggedInSame && sidebarOpenedSame)
	// }

	componentWillMount () {
		const {isLoggedIn} = this.props

	}

	/**
   * Checks that user is still allowed to visit path after props changed
   * @param  {Object} nextProps
   */
	componentWillReceiveProps (nextProps) {
		}

	componentDidMount () {
		utils.init_property_bar();
		// Create the graph canvas in the chosen div element
		graph_viz.init("#main");
		// Add the zoom layer to the graph
		//var svg_graph =
		graph_viz.addzoom();
		//graph_viz.layers.set_nb_layers(4);

		// Create the info box for node details
		infobox.create("#graphInfo","#nodeInfo");
	}


	render () {
	/*	const {
			search_query,
			clear_graph,
			show_names,
			set_nb_layers,
			get_graph_info,
			show_hide_element
		} = this.props
 */

	  const show_names = graphShapes.show_names;
		const search_query = utils.search_query;
		const clear_graph = utils.clear_graph;
		const set_nb_layers = utils.set_nb_layers;
		const get_graph_info = utils.get_graph_info;
		const show_hide_element = utils.show_hide_element;

		const navBarProps = {
			search_query,
			clear_graph,
			show_names,
			set_nb_layers
		}
		const dashboardProps = {
			get_graph_info,
			show_hide_element
		}
		const footerProps = {
		}

		return (
			<div>
			<NavBar {...navBarProps}></NavBar>
		  <Dashboard {...dashboardProps}></Dashboard>
			<Footer {...footerProps}></Footer>
	</div>

		)
	}
}

function mapStateToProps (state) {
		return {
		}
}

function mapDispatchToProps (dispatch) {
	let resizer
	return {
		closeSidebar: () => {
			dispatch(CLOSE_SIDEBAR())
		},
		logout: () => {
			dispatch(LOGOUT_AUTH())
		},
		toggleSidebar: () => {
			dispatch(OPEN_SIDEBAR())
		},
		/**
         * Immediately push to homePath('/'), if user is logged.
         * Can be used for other auth logic checks.
         * Useful, because we don't need to dispatch `push(homePath)` action
         * from `Login` container after LOGIN_AUTH_SUCCESS action
         * @param  {String}  path       [current location path]
         * @param  {Boolean} isLoggedIn [is user logged in?]
         */
		checkAuthLogic: (path, isLoggedIn) => {
			const authPath = '/auth'
			const homePath = '/'
			if (isLoggedIn && path === authPath) {
				dispatch(push(homePath))
			}
		},
		handleWindowResize: () => {
			clearTimeout(resizer)
			resizer = setTimeout(() => dispatch(WINDOW_RESIZE()), 150)
		}
	}
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App))
