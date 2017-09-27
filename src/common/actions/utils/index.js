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
import {infobox, graphShapes, graph_viz, graphioGremlin} from 'actions'

function search_query(){
	//if (typeof graph_viz.simulation!=='undefined') {graph_viz.simulation.stop(); console.log('Simulation stopped!');}
	graphioGremlin.search_query();
}

function get_graph_info(){
	graphioGremlin.get_graph_info();
	infobox.show_element("#graphInfo");
	document.getElementById ("showgraphinfo").checked = true;
}

function init_property_bar(){
	document.getElementById('nbLayers').value = default_nb_of_layers;
}

function change_nav_bar(node_data,edge_data){
	var nav_bar = d3.select("#prop_choice");
	nav_bar.select("input").remove();
	nav_bar.select("select").remove();
	//nav_choices = nav_bar.append("ul");
	//nav_choices.append("li").append("button").attr("onclick",search_query).text("Search")
	var select = d3.select('#prop_choice')
		.append('select').attr('class','select').attr('id','search_field')

	var select_node = select.append('optgroup').attr('label','Nodes')
		//.on('change',onchange)

	var select_edge = select.append('optgroup').attr('label','Edges')

	var node_options = select_node
		.selectAll('option')
		.data(node_data).enter()
		.append('option')
		.text(function (d) { return d; });

	var edge_options = select_edge
		.selectAll('option')
		.data(edge_data).enter()
		.append('option')
		.text(function (d) { return d; });

}
function display_properties_bar(prop_list,item,text){
	var nav_bar = d3.select("#graphInfoBar");
	nav_bar.select("#property_bar_"+item).remove();
	var property_bar = nav_bar.append("div").attr("id","property_bar_"+item);
	property_bar.append('text').text(text).style("font-weight","bold");
	//d3.select('#property_bar').append('text').text('hello')
	var property_label = property_bar.selectAll('input').append("ul")
		.data(prop_list).enter().append("li");
		//.append('label');


	property_label.append('input').attr('type','checkbox').attr('id',function (d) { return item+"_"+d; })
		.attr('id_nb',function (d) { return prop_list.indexOf(d); })
		//.attr('onchange',function(d){display_prop(d);});
		.on('change',function(e) {
			display_prop(this);
		});

	property_label.append('label').text(function (d) { return d; });


}


function display_color_choice(prop_list,item,text){
	prop_list = ['none','label'].concat(prop_list);
	var nav_bar = d3.select("#graphInfoBar");
	nav_bar.select("#color_choice_"+item).remove();
	var color_bar = nav_bar.append("div").attr("id","color_choice_"+item);
	color_bar.append("div").append("text").text(text).style("font-weight","bold");
	color_bar.append("div").append("select").attr("class","select").attr("id","color_select_"+item)
		.attr("onchange",function(e) {
			colorize.bind(this)();
		})
		.selectAll("option")
		.data(prop_list).enter()
		.append("option")
		.text(function (d) { return d; });
}

function colorize(selection){
	if(!selection) return;
	var value = selection.value;
	console.log(value);
	graphShapes.colorize(value);

}
function display_prop(prop){
	if(!prop) return;
	var prop_id = prop.id;
	var prop_id_nb = prop.getAttribute('id_nb');
	var text_base_offset = 10;
	var text_offset = 10;
	var prop_name = prop_id.slice(prop_id.indexOf("_")+1);
	var item = prop_id.slice(0,prop_id.indexOf("_"));
	if(d3.select("#"+prop_id).property("checked")){
		if (item=='nodes'){
		var elements_text = d3.selectAll('.node');
	}
	else if (item=='edges'){
		var elements_text = d3.selectAll('.edgelabel');
	}
		attach_property(elements_text,prop_name,prop_id_nb,item)
	}
	else{
		if (item=='nodes'){
			d3.selectAll('.node').select('.'+prop_id).remove();
		}
		else if (item=='edges'){
			d3.selectAll('.edgelabel').select('.'+prop_id).remove();
		}

	}
}


function attach_property(graph_objects,prop_name,prop_id_nb,item){
	var text_base_offset = 10;
	var text_offset = 10;
	var prop_id = item+"_"+prop_name;
	if (item=='nodes'){
		elements_text = graph_objects.append("text").style("pointer-events", "none");
	}
	else if (item=='edges'){
		var elements_text = graph_objects.append("textPath")
		.attr('class','edge_text')
		.attr('href', function (d, i) {return '#edgepath' + d.id})
		.style("text-anchor", "middle")
		.style("pointer-events", "none")
		.attr("startOffset", "70%");
		//.text(function (d) {return d.label});
		prop_id_nb = prop_id_nb + 1;
	}
	else { console.log('Bad item name.'); return 1;}
	elements_text.classed("prop_details",true).classed(prop_id,true)
			//.attr("x", 12)
			.attr("dy",function(d){return graphShapes.node_size(d)+text_base_offset+text_offset*parseInt(prop_id_nb);})
			//.attr("y", ".31em")
		.text(function(d){return get_prop_value(d,prop_name,item);});
	}


function get_prop_value(d,prop_name,item){
	if (prop_name in d.properties){
		if (item=='nodes'){
			if(TINKER_VERSION <= 3.2)
				return d.properties[prop_name][0].value;
			else return d.properties[prop_name].value;
		}
		else if (item=='edges'){
			console.log(d.properties[prop_name])
			if(TINKER_VERSION <= 3.2)
				return d.properties[prop_name];
			else return d.properties[prop_name]["value"];
		}
	}
	else {
		return "";
	}
}

function set_nb_layers(){
	var nb_layers = parseInt(document.getElementById('nbLayers').value);
	//var nb_layers = parseInt(layer_input.getAttribute("value"));
	console.log(nb_layers)
	graph_viz.layers.set_nb_layers(nb_layers);

}

function show_hide_element(element_label){
	element = d3.select(element_label);
	var input = document.getElementById ("showgraphinfo");
	var isChecked = input.checked;
	if (isChecked) element.style("display", "inline");
	else {element.style("display", "none");}
}
const clear_graph = () => {

}
export	{ search_query,get_graph_info,init_property_bar,change_nav_bar,
display_properties_bar,display_color_choice,colorize,display_prop,
attach_property,get_prop_value,set_nb_layers,show_hide_element,
clear_graph};
