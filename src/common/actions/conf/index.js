
// configuration for the graph database access
export const HOST = "localhost"
export const PORT = "8182"
// The communication protocol with the server can be "REST" or "websocket"
//export const COMMUNICATION_PROTOCOL = "REST";
//export const COMMUNICATION_PROTOCOL = "websocket";
export const COMMUNICATION_PROTOCOL = "xhr_wrapper";
export const TINKER_VERSION = 3.2;
// TODO: configuration for the secure server

// Graph configuration
export const default_nb_of_layers = 3;
export const node_limit_per_request = 50;
// Simulation
export const force_strength = -600;
export const link_strength = 0.2;
export const force_x_strength = 0.1;
export const force_y_strength = 0.1;
// Nodes
export const default_node_size = 15;
export const default_stroke_width = 2;
export const default_node_color = "#80E810";
export const active_node_margin = 6;
export const active_node_margin_opacity = 0.3;

// Edges
export const default_edge_stroke_width = 3;
export const default_edge_color = "#CCC";
export const edge_label_color = "#111";
