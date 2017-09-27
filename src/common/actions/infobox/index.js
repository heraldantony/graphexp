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

// Module to display information on the side bars of the visualization page.

import * as d3 from 'd3'
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
	//private variables
	var _table_IDinfo = {};
	var _table_DBinfo = {};
	var _table_Graphinfo = {};
	var _side_image = {};
	var _font_size = "12px";

	////////////////////////
	// Public function
	const create = (label_graph,label_graphElem) => {
		var graph_bar = d3.select(label_graph);
		graph_bar.append("h2").text("Graph Info")
		_table_Graphinfo = graph_bar.append("table").attr("id","tableGraph");
		init_table(_table_Graphinfo,["Type","Count"]);

		var graphElem_bar = d3.select(label_graphElem);
		graphElem_bar.append("h2").text("Item Info")
		_table_IDinfo = graphElem_bar.append("table").attr("id","tableIdDetails");
		init_table(_table_IDinfo,["Key","Value"]);
		_table_DBinfo = graphElem_bar.append("table").attr("id","tableDBDetails");
		init_table(_table_DBinfo,["Key","Value","Id"]);
		hide_element(label_graph);

	}

	function init_table(table_handle,entries){
		var table_head = table_handle.append("thead");
	  	var row = table_head.append("tr");
	  	for (var key in entries){
	 		row.append("th").text(entries[key]);
	 	}
	 	var table_body = table_handle.append("tbody");
	  	var row = table_body.append("tr");
	  	for (var key in entries){
	 		row.append("td").text("");
	 	}
	}

	const display_graph_info_old = (data) => {
		_table_Graphinfo.select("tbody").remove();
			var info_table = _table_Graphinfo.append("tbody");
			var data_to_display = data[0][0];
			append_keysvalues(info_table,{"Node labels":""},"bold");
			append_keysvalues(info_table,data_to_display,"normal");
			data_to_display = data[1][0];
			append_keysvalues(info_table,{"Nodes properties":""},"bold");
			append_keysvalues(info_table,data_to_display,"normal");
			var data_to_display = data[2][0];
			append_keysvalues(info_table,{"Edge labels":""},"bold");
			append_keysvalues(info_table,data_to_display,"normal");
			data_to_display = data[3][0];
			append_keysvalues(info_table,{"Edge properties":""},"bold");
			append_keysvalues(info_table,data_to_display,"normal");
	}
	function processKeyValueMapFromArray(data, i, j) {
		if(TINKER_VERSION <= 3.2) return data[i][j];
		var d=data['@value'][i]['@value'][j]['@value'];
		var map={};
		if(d.length) {
			for(var k=0; k<d.length; k=k+2) {
				var key=d[k];
				if(d[k]['@type'] == 'g:Set') {
					key="["+d[k]['@value'].join(",") + "]";
				}
				map[key] =  d[k+1]['@type'] ? d[k+1]['@value'] : d[k+1];
			}
		}
		return map;
	}
	const display_graph_info = (data) => {
		_table_Graphinfo.select("tbody").remove();
	  	var info_table = _table_Graphinfo.append("tbody");
	  	var data_to_display = processKeyValueMapFromArray(data,0,0);
	  	append_keysvalues(info_table,{"Node labels":""},"bold");
	  	append_keysvalues(info_table,data_to_display,"normal");
	  	data_to_display = processKeyValueMapFromArray(data,1,0);
	  	append_keysvalues(info_table,{"Nodes properties":""},"bold");
	  	append_keysvalues(info_table,data_to_display,"normal");
	  	var data_to_display = processKeyValueMapFromArray(data, 2, 0);
	  	append_keysvalues(info_table,{"Edge labels":""},"bold");
	  	append_keysvalues(info_table,data_to_display,"normal");
	  	data_to_display = processKeyValueMapFromArray(data, 3, 0);
	  	append_keysvalues(info_table,{"Edge properties":""},"bold");
	  	append_keysvalues(info_table,data_to_display,"normal");
	}

	function append_keysvalues(table_body,data,type){
		for (var key in data){
			var info_row = table_body.append("tr");
	 		var key_text = info_row.append("td").text(key).style("font-size",_font_size);
	 		var value_text = info_row.append("td").text(data[key]).style("font-size",_font_size);
	 		if (type=="bold") {
	 			key_text.style('font-weight','bolder');}
		}
	}

	const hide_element = (element_label) => {
		var element = d3.select(element_label);
		element.style('display','none');
	}
	const  show_element = (element_label) => {
		var element = d3.select(element_label);
		element.style('display','inline');
	}

	function show_graph_info(){
		show_element(_)
	}

	const  display_info = (node_data) => {
		// remove previous info
		_display_IDinfo(node_data)
		_display_DBinfo(node_data);
	}

	//////////////////////
	// Private functions
	function _display_IDinfo(d){
		_table_IDinfo.select("tbody").remove();
	  	var info_table = _table_IDinfo.append("tbody");
	  	// Keep only the entries in id_keys, to display
	  	var id_keys = ["id","label"];
	  	var data_dic = {}
	  	for (var key in id_keys){
	  		data_dic[id_keys[key]] = d[id_keys[key]]
	  	}
	  	append_keysvalues(info_table,data_dic)
	}


	function _display_DBinfo(d){
		_table_DBinfo.select("tbody").remove();
	 	var info_table = _table_DBinfo.append("tbody");
	 	if (d.type=='vertex'){
		 	for (var key in d.properties){
		 	//	for (var subkey in d.properties[key]){
		 			var new_info_row = info_table.append("tr");
		 			new_info_row.append("td").text(key).style("font-size",_font_size);
					//new_info_row.append("td").text(d.properties[key][subkey].value).style("font-size",_font_size);
		 			//new_info_row.append("td").text(d.properties[key][subkey].id).style("font-size",_font_size);// TODO: handle VertexProperty
		 			new_info_row.append("td").text(d.properties[key].value).style("font-size",_font_size);
		 			new_info_row.append("td").text(d.properties[key].id).style("font-size",_font_size);// TODO: handle VertexProperty
		 		//}
		 	}
		}
		else {
		 	for (var key in d.properties){
		 		var new_info_row = info_table.append("tr");
	 			new_info_row.append("td").text(key);
	 			new_info_row.append("td").text(d.properties[key]);
	 			new_info_row.append("td").text("")
			}
		}
	}

export	{ create,display_info,
	display_graph_info,hide_element,show_element};
