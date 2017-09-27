/*
Copyright 2017 Benjamin RICAUD

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

// Interface between the visualization and the Gremlin server.
import requestWrapper from '../xhr_wrapper'
import {
	 HOST,
	PORT,
	COMMUNICATION_PROTOCOL,
  default_nb_of_layers,node_limit_per_request,force_strength,
	link_strength,force_x_strength,force_y_strength,
	default_node_size,default_stroke_width,default_node_color,
	active_node_margin,active_node_margin_opacity,
	default_edge_stroke_width,default_edge_color,edge_label_color,
	TINKER_VERSION
} from '../conf'
import $ from 'jquery'
import * as d3 from 'd3'
export const get = requestWrapper('GET')
export const post = requestWrapper('POST')
export const put = requestWrapper('PUT')
export const patch = requestWrapper('PATCH')
export const del = requestWrapper('DELETE')
import {infobox, graph_viz, utils} from 'actions'

	var _node_properties = [];
	var _edge_properties = [];

  function processData(data) {
		if(data['@type'] == 'g:List') {
			var arr=[];
			var dataValArr=data['@value'];
			dataValArr.forEach(function(ai) {
				if(ai['@type']) arr.push(processData(ai));
				else arr.push(ai);
			});
			return arr;
		} else if(data['@type'] == 'g:Map') {
			var dataValArr=data['@value'];
			//if object has type, then process it and add to
			//array, otherwise the array
			//is made of key and values
			if(dataValArr.length > 0 && dataValArr[0]['@type']) {
				var arr=[];
				dataValArr.forEach(function(ai) {
					if(ai['@type']) arr.push(processData(ai));
					else arr.push(ai);
				});
				return arr;
			}
			var map={};

			for(var i=0; i<dataValArr.length; i=i+2) {

				var key=dataValArr[i];
				if(dataValArr[i+1]['@type'])
					map[key]=processData(dataValArr[i+1]);
				else map[key] = dataValArr[i+1];
			}
			return map;
		} else if(data['@type'] == 'g:Set') {
			var arr=[];
			var dataValArr=data['@value'];
			dataValArr.forEach(function(ai) {
				if(ai['@type']) arr.push(processData(ai));
				else arr.push(ai);

			});
			return arr;
		} else if( data['@type']){
			return processData(data['@value']);
		} else {
			return data;
		}
	}
	function get_node_properties(){
		return _node_properties;
	}
	function get_edge_properties(){
		return _edge_properties;
	}

	function get_graph_info(){
		var gremlin_query_nodes = "g = graph.traversal(); nodes = g.V().groupCount().by(label);"
		var gremlin_query_edges = "edges = g.E().groupCount().by(label);"
		var gremlin_query_nodes_prop = "nodesprop = g.V().valueMap().select(keys).groupCount();"
		var gremlin_query_edges_prop = "edgesprop = g.E().valueMap().select(keys).groupCount();"

		var gremlin_query = gremlin_query_nodes+gremlin_query_nodes_prop
			+gremlin_query_edges+gremlin_query_edges_prop
			+ "[nodes.toList(),nodesprop.toList(),edges.toList(),edgesprop.toList()]"
		// while busy, show we're doing something in the messageArea.
		$('#messageArea').html('<h3>(loading)</h3>');
		var message = "<p> Graph info</p>"
		send_to_server(gremlin_query,'graphInfo',null,message)
	}



	function search_query() {
		// Preprocess query
		var input_string = $('#search_value').val();
		var input_field = $('#search_field').val();
		console.log(input_field)
	 	var filtered_string = input_string;//You may add .replace(/\W+/g, ''); to refuse any character not in the alphabet
	 	if (filtered_string.length>50) filtered_string = filtered_string.substring(0,50); // limit string length
		// Translate to Gremlin query
	  	if (input_string==""){
	  		var gremlin_query_nodes = "nodes = g.V().limit("+node_limit_per_request+")"
	  		var gremlin_query_edges = "edges = g.V().limit("+node_limit_per_request+").aggregate('node').outE().as('edge').inV().where(within('node')).select('edge')"
	  		var gremlin_query = gremlin_query_nodes+"\n"+gremlin_query_edges+"\n"+"[nodes.toList(),edges.toList()]"

	  			  	}
	  	else{
	  		if (isInt(input_string)){
	  			var has_str = "has('"+input_field+"',"+filtered_string+")"
	  		} else {
	  			var has_str = "has('"+input_field+"','"+filtered_string+"')"
	  		}
			var gremlin_query = "g.V()."+has_str
	  		var gremlin_query_nodes = "nodes = g.V()."+has_str
	  		var gremlin_query_edges = "edges = g.V()."+has_str
	  			+".aggregate('node').outE().as('edge').inV().where(within('node')).select('edge')"
	  		var gremlin_query = gremlin_query_nodes+"\n"+gremlin_query_edges+"\n"+"[nodes.toList(),edges.toList()]"
	  		console.log(gremlin_query)
		}

	  	// while busy, show we're doing something in the messageArea.
	  	$('#messageArea').html('<h3>(loading)</h3>');
		var message = "<p>Query: '"+ filtered_string +"'</p>"
		send_to_server(gremlin_query,'search',null,message)
	}

	function isInt(value) {
	  return !isNaN(value) &&
	         parseInt(Number(value)) == value &&
	         !isNaN(parseInt(value, 10));
	}
	function click_query(d) {
		// Gremlin query
		var gremlin_query = "g.V("+d.id+").bothE().bothV().path()"
		// while busy, show we're doing something in the messageArea.
		$('#messageArea').html('<h3>(loading)</h3>');
		var message = "<p>Query ID: "+ d.id +"</p>"
		send_to_server(gremlin_query,'click',d.id,message)
	}

	function send_to_server(gremlin_query,query_type,active_node,message){
		if (COMMUNICATION_PROTOCOL == 'REST'){
			run_ajax_request(gremlin_query,query_type,active_node,message);
		}
		else if (COMMUNICATION_PROTOCOL == 'websocket'){
			run_websocket_request(gremlin_query,query_type,active_node,message);
		}
		else if (COMMUNICATION_PROTOCOL == 'xhr_wrapper'){
			run_xhr_wrapper_request(gremlin_query,query_type,active_node,message);
		}
		else {
			console.log('Bad communication protocol. Check configuration file. Accept "REST" or "websocket" .')
		}
	}

	/////////////////////////////////////////////////////////////////////////////////////////////////
	// AJAX request for the REST API
	////////////////////////////////////////////////////////////////////////////////////////////////
	function run_ajax_request(gremlin_query,query_type,active_node,message){
		// while busy, show we're doing something in the messageArea.
		$('#messageArea').html('<h3>(loading)</h3>');

		// Get the data from the server
		$.ajax({
			type: "POST",
			accept: "application/json",
			//contentType:"application/json; charset=utf-8",
			url: "http://"+HOST+":"+PORT,
			//headers: GRAPH_DATABASE_AUTH,
			Timeout:2000,
			data: JSON.stringify({"gremlin" : gremlin_query}),
			success: function(data, textStatus, jqXHR){
				var Data = data.result.data;
				//console.log(Data)
				handle_server_answer(Data,query_type,active_node,message);
			},
			failure: function(msg){
				console.log("failed");
				$('#outputArea').html("<p> Can't access database </p>");
				$('#messageArea').html('');
			}
		});
	}

	/////////////////////////////////////////////////////////////////////////////////////////////////
	// AJAX request for the REST API
	////////////////////////////////////////////////////////////////////////////////////////////////
	function run_xhr_wrapper_request(gremlin_query,query_type,active_node,message){
		// while busy, show we're doing something in the messageArea.
		$('#messageArea').html('<h3>(loading)</h3>');
		console.log("POST params =", gremlin_query);
		//post("http://"+HOST+":"+PORT,{"gremlin" : gremlin_query},{} );
    post("/api",{"gremlin" : gremlin_query},{} )
			.then(function(resp) {
				var data = resp.data.result.data;
				//data=processData(data);
				console.log(data)
				handle_server_answer(data,query_type,active_node,message);

			},
			function(msg){
				console.log("failed");
				$('#outputArea').html("<p> Can't access database </p>");
				$('#messageArea').html('');
			});

	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////
	// Websocket connection
	/////////////////////////////////////////////////////////////////////////////////////////////////////
	function run_websocket_request(gremlin_query,query_type,active_node,message){
		$('#messageArea').html('<h3>(loading)</h3>');

		var msg = { "requestId": uuidv4(),
  			"op":"eval",
  			"processor":"",
  			"args":{"gremlin": gremlin_query,
  				"bindings":{},
          		"language":"gremlin-groovy"}}

		var data = JSON.stringify(msg);

		var ws = new WebSocket("ws://"+HOST+":"+PORT+"/gremlin");
		ws.onopen = function (event){
			ws.send(data,{ mask: true});
		};
		ws.onerror = function (err){
			console.log('Connection error');
			console.log(err);
			$('#outputArea').html("<p> Connection error </p>");
			$('#messageArea').html('');

		};
		ws.onmessage = function (event){
			var response = JSON.parse(event.data);
			var data = response.result.data;
			if (data == null){
				$('#outputArea').html(response.status.message);
				$('#messageArea').html('Server error');
				return 1;}
			//console.log(data)
			handle_server_answer(data,query_type,active_node,message);
		};
	}

	// Generate uuid for websocket requestId. Code found here:
	// https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
	function uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
	    return v.toString(16);
	  });
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////
	function handle_server_answer(data,query_type,active_node,message){
		if (query_type=='click'){
			var graph;
			if(TINKER_VERSION > 3.2)
			 graph = arrange_data_path_new(data);
			else graph = arrange_data_path(data);
			//console.log(graph)
			var center_f = 0;
			graph_viz.refresh_data(graph,center_f,active_node); //center_f=0 mean no attraction to the center for the nodes
		}
		else if (query_type=='search'){
			var graph;
			if(TINKER_VERSION > 3.2) {
				graph = arrange_data_new(data);
			} else graph = arrange_data(data);
			//console.log(graph)
			var center_f = 1;
			graph_viz.refresh_data(graph,center_f,active_node);
		}
		else if (query_type=='graphInfo'){
			infobox.display_graph_info(data);
			if(TINKER_VERSION > 3.2) {
			_node_properties = make_properties_list_new(data,1,0);
			_edge_properties = make_properties_list_new(data, 3,0);
		} else {
			_node_properties = make_properties_list(data[1][0]);
			_edge_properties = make_properties_list(data[3][0]);
		}
			utils.change_nav_bar(_node_properties,_edge_properties);
			utils.display_properties_bar(_node_properties,'nodes','Node properties:');
			utils.display_properties_bar(_edge_properties,'edges','Edge properties:');
			utils.display_color_choice(_node_properties,'nodes','Node color by:');
		}
		$('#outputArea').html(message);
		$('#messageArea').html('');
	}



	//////////////////////////////////////////////////////////////////////////////////////////////////
	function make_properties_list(data){
		var prop_dic = {};
		for (var prop_str in data){
			prop_str = prop_str.slice(0,-1);
			var prop_list = prop_str.split(',');
			prop_list = prop_list.map(function (e){e=e.slice(1); return e;});
			for (var prop_idx in prop_list){
				prop_dic[prop_list[prop_idx]] = 0;
			}
		}
		var properties_list = [];
		for (var key in prop_dic){
			properties_list.push(key);
		}
		return properties_list;
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////
	function make_properties_list_new(data, i, j){
		var d= data['@value'][i]['@value'][j]['@value'];
		//d is array with g:Set and value alternating
		var prop_dic = {};
		for (var k=0; k<d.length; k=k+2){
			var prop_list = d[k];
			if(prop_list['@type']) prop_list=prop_list['@value'];
			//putting into a dict will remove any duplicates
			prop_list.forEach(function(p){
				prop_dic[p] = 0;
			});
		}
		var properties_list = [];
		for (var key in prop_dic){
			properties_list.push(key);
		}
		return properties_list;
	}
	///////////////////////////////////////////////////
	function idIndex(list,elem) {
	  // find the element in list with id equal to elem
	  // return its index or null if there is no
	  for (var i=0;i<list.length;i++) {
		if (list[i].id == elem) return i;
	  }
	  return null;
	}

	/////////////////////////////////////////////////////////////
	function arrange_data(data) {
	  	// Extract node and edges from the data returned for 'search' request
	  	// Create the graph object
	  	var nodes=[], links=[];
	  	for (var key in data){
	  		data[key].forEach(function (item) {
	  		if (item.type=="vertex" && idIndex(nodes,item.id) == null) // if vertex and not already in the list
	  			nodes.push(extract_info(item));
	  		if (item.type=="edge" && idIndex(links,item.id) == null)
	  			links.push(extract_info(item));
			});
	  	}
	  return {nodes:nodes, links:links};
	}
  function getObjectId(obj) {
		return obj['id']['@type']?obj['id']['@value'] : obj['id'];
	}
	function arrange_data_new(data) {
			// Extract node and edges from the data returned for 'search' request
			// Create the graph object
			var nodes=[], links=[];
			var d=data['@value'];
			d.forEach(function(dv) {
				//dv could be a list of vertices or edges
				dv = dv['@value'];
				dv.forEach(function(v_or_e) {
					var item={};
					item.id = getObjectId(v_or_e['@value']);
					item.label = v_or_e['@value']['label'];
					item.properties = v_or_e['@value']['properties'];
					if(v_or_e['@type'] == 'g:Vertex') {
						item.type="vertex";
					} else {
						item.type="edge";
						item.inV=v_or_e['@value']['inV'];
						item.outV=v_or_e['@value']['outV'];
						item.inVLabel=v_or_e['@value']['inVLabel'];
						item.outVLabel=v_or_e['@value']['outVLabel'];
					}
					if (item.type=="vertex" && idIndex(nodes,item.id) == null) // if vertex and not already in the list
						nodes.push(extract_info(item));
					if (item.type=="edge" && idIndex(links,item.id) == null)
						links.push(extract_info(item));
				});
			});

		return {nodes:nodes, links:links};
	}

	function arrange_data_path_new(data) {
	  	// Extract node and edges from the data returned for 'click' request
	  	// Create the graph object
	  	var nodes=[], links=[];
			var d=data['@value'];
			d.forEach(function(dv) {
				//dv could be a list of vertices or edges
				dv = dv['@value'];
				dv.forEach(function(v_or_e) {
					var item={};
					item.id = getObjectId(v_or_e['@value']);
					item.label = v_or_e['@value']['label'];
					item.properties = v_or_e['@value']['properties'];
					if(v_or_e['@type'] == 'g:Vertex') {
						item.type="vertex";
					} else {
						item.type="edge";
						item.inV=v_or_e['@value']['inV'];
						item.outV=v_or_e['@value']['outV'];
						item.inVLabel=v_or_e['@value']['inVLabel'];
						item.outVLabel=v_or_e['@value']['outVLabel'];
					}
	  		if (item.type=="vertex" && idIndex(nodes,item.id) == null) // if vertex and not already in the list
	  			nodes.push(extract_info(item));
	  		if (item.type=="edge" && idIndex(links,item.id) == null)
	  			links.push(extract_info(item));
			});
		});
	  return {nodes:nodes, links:links};
	}

	function arrange_data_path(data) {
	  	// Extract node and edges from the data returned for 'click' request
	  	// Create the graph object
	  	var nodes=[], links=[];
	  	for (var key in data){
	  		data[key].objects.forEach(function (item) {
	  		if (item.type=="vertex" && idIndex(nodes,item.id) == null) // if vertex and not already in the list
	  			nodes.push(extract_info(item));
	  		if (item.type=="edge" && idIndex(links,item.id) == null)
	  			links.push(extract_info(item));
			});
	  	}
	  return {nodes:nodes, links:links};
	}

function extract_info(data) {
	if(TINKER_VERSION > 3.2) {
		return extract_info_3_3(data);
	} else return extract_info_3_2(data);
}
function extract_info_3_2(data) {
	var data_dic = {id:data.id, label:data.label, type:data.type, properties:{}}
	var prop_dic = data.properties
	for (var key in prop_dic) {
			if (prop_dic.hasOwnProperty(key)) {
			data_dic.properties[key] = prop_dic[key]}
	}
	if (data.type=="edge"){
		data_dic.source = data.outV
		data_dic.target = data.inV
	}
	return data_dic
}
	function extract_info_3_3(data) {
		var data_dic = {id:data.id, label:data.label, type:data.type, properties:{}}
		var prop_dic = data.properties
		for (var key in prop_dic) {
  			if (prop_dic.hasOwnProperty(key)) {
					var v;
					if(data.type=="vertex") {
						v = prop_dic[key][0]['@value'];
						v.id=getObjectId(v);
						v.value=v.value['@type']?v.value['@value']:v.value;
				  }
					else {
						v=prop_dic[key]['@value'];
						v.value=v.value['@type']?v.value['@value']:v.value;
					}
				data_dic.properties[key] = v
			}
		}
		if (data.type=="edge"){
			data_dic.source = data.outV['@value']
			data_dic.target = data.inV['@value']
		}
		return data_dic
	}



export		{	get_node_properties,
 get_edge_properties,
get_graph_info,
search_query,
click_query };
