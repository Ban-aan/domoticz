
extraHWValidateParams = function (data, validators) {
	if(!data["extra"])
		return true;
	var p = data["extra"].split(";");
	var topin = "";
	var topout = "";
	var topdisc = "";
	if (p.length > 1)
		topin = p[1];
	if (p.length > 2)
		topout = p[2];
	if (p.length > 3)
		topdisc = p[3];
	return validators["MQTTTopic"](topin, "Topic in Prefix") && validators["MQTTTopic"](topout, "Topic out Prefix") &&
		validators["MQTTTopic"](topdisc, "Discovery Prefix");
}

extraHWInitParams = function(data) {
	$("#hardwarecontent #hardwareparamsmqtt #filename").val("");
	$("#hardwarecontent #divextrahwparams #mqtttopicin").val("");
	$("#hardwarecontent #divextrahwparams #mqtttopicout").val("");
	$("#hardwarecontent #divextrahwparams #mqttdiscoveryprefix").val("");

	if(!data["Extra"])
		data["Extra"] = ";domoticz/in;domoticz/out;homeassistant";
	
	if(!data["Mode1"])
		data["Mode1"] = 1;
	
	if(!data["Mode2"])
		data["Mode2"] = 2;
	
	if(!data["Mode3"])
		data["Mode3"] = 1;
	
	if(!data["Port"])
		data["Port"] = 1883;
	
	// Break out any possible topic prefix pieces.
	var CAfilenameParts = data["Extra"].split(";");
	if (CAfilenameParts.length > 0)
		$("#hardwarecontent #hardwareparamsmqtt #filename").val(CAfilenameParts[0]);
	if (CAfilenameParts.length > 1)
		$("#hardwarecontent #hardwareparamsmqtt #mqtttopicin").val(CAfilenameParts[1]);
	if (CAfilenameParts.length > 2)
		$("#hardwarecontent #hardwareparamsmqtt #mqtttopicout").val(CAfilenameParts[2]);
	if (CAfilenameParts.length > 3)
		$("#hardwarecontent #hardwareparamsmqtt #mqttdiscoveryprefix").val(CAfilenameParts[3]);

	$("#hardwarecontent #divextrahwparams #hardwareparamsmqtt #combotopicselect").val(data["Mode1"]);
	$("#hardwarecontent #hardwareparamsmqtt #combotlsversion").val(data["Mode2"]);
	$("#hardwarecontent #hardwareparamsmqtt #combopreventloop").val(data["Mode3"]);
	$("#hardwarecontent #divremote").show();
	$("#hardwarecontent #divlogin").show();
}

extraHWUpdateParams = function(validators) {
	var data = {};
	var mqtttopicin = $("#hardwarecontent #divextrahwparams #mqtttopicin").val().trim();
	var mqtttopicout = $("#hardwarecontent #divextrahwparams #mqtttopicout").val().trim();
	var mqttdiscoveryprefix = $("#hardwarecontent #divextrahwparams #mqttdiscoveryprefix").val().trim();
	data["extra"] = $("#hardwarecontent #divextrahwparams #filename").val().trim();
	data["extra"] += ";" + mqtttopicin + ";" + mqtttopicout + ";" + mqttdiscoveryprefix;
	data["Mode1"] = $("#hardwarecontent #divextrahwparams #combotopicselect").val();
	data["Mode2"] = $("#hardwarecontent #divextrahwparams #combotlsversion").val();
	data["Mode3"] = $("#hardwarecontent #divextrahwparams #combopreventloop").val();
	if(!extraHWValidateParams(data, validators))
		return false;
	return data;
}

