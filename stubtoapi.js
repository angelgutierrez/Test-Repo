$(document).ready(function() {
    
    window.modelsArray= [];
    window.collectionsArray = [];
    window.tmp = {};

    getAvalonResponse = function(url) {
        var resp = {},
            success1 = function(d) {window.tmp = d},
            successf = function(d) {
                success1(d.result.rows);
            },
            resultobj = $.getJSON(url, successf);
        return resultobj;
    };
    AvalonModel = Backbone.Model.extend({
        getRecord: function () {},
        updateRecord: function() {},
        deleteRecord: function() {}
    });
    
    AvalonCollection = Backbone.Collection.extend({
        getRecords: function(){
            var results = [],
                tmpPackage = $.getJSON(this.url, function(data) {
                    results =  data.result.rows;
                });
            return results;
            },
        addRecord: function() {},
        deleteRecords: function() {}
    });

    Item = Backbone.Model.extend({
        save: function(attr, options) {
            console.log("saving: "+this.get('name')+':'+this.id);
            Backbone.Model.prototype.save.call(this, attr, options);
         }
    });

    Items = Backbone.Collection.extend({
        model: Item,
        url: '/rest/api/foo'
    });

    mylist = new Items();
    mylist.url = '/rest/api/core.groups';
                                       
    (function() {
        var metadataurl = '/rest/api/metadata',
            modelsPackage = $.getJSON(metadataurl + '/models', function(data) {
                _(data.result.rows).each(function(entry) {
                    window.modelsArray[entry.name] = new AvalonModel({
                        name: entry.name,
                        schema: entry,
                        id:entry._id
                    });                                            
                    console.log('Model|'+entry.name);
                });
            }),
            collectionPackage = $.getJSON(metadataurl + '/collections', function(data) {
                _(data.result.rows).each(function(entry) {
                    window.collectionsArray[entry.name] = new AvalonCollection({
                        name: entry.name,
                        id: entry._id,
                        url: entry.url,
                        model: modelsArray[entry.model]
                    });
                    console.log('Collection|'+entry.name);
                });
            });
    })();
    
    AppView = Backbone.View.extend({
        el: $("body"),
        events: {
            "click #refresh-models": "refreshModels",
            "click .collection": "showCollection"
        },
        initialize: function() {
            $('#modellist').append("<tr><th>Model Name</th><th>Model ID</th></tr>");
            $('#collectionlist').append("<tr><th>Collection Name</th><th>Collection ID</th><th></th></tr>");
        },
        refreshModels: function () {
            _.each(_.keys(modelsArray), function(key) {
                $('#modellist').append("<tr><td>"+key+"</td><td>"+modelsArray[key].id+"</td></tr>");
            });
            _.each(_.keys(collectionsArray), function(key) {
                $('#collectionlist').append("<tr><td>"+key+"</td><td>"+collectionsArray[key].id+"</td>"+
                                            "<td><button class='collection' name='"+key+"'>Select</button></td></tr>");
            });
        },
        showCollection: function(context) {
            var collectionName = $(context.target).attr('name');
            console.log('selected: '+ collectionName);
            //collectionsArray[collectionName].fetch();
            
        }
            
    });
    
    window.appview = new AppView;

    Backbone.sync = function(method, model, success, error) {
        var methodMap = {read: 'GET', create: 'POST', update: 'POST', delete: 'DELETE'},
            type = methodMap[method],
            modelJSON = (method === 'create' || method === 'update') ? JSON.stringify(model.toJSON()) : null,
            mysuccess = function(data) {
                var avdata;
                console.log("total: "+ JSON.stringify(data.result));
                if (!data.result.rows) 
                    avdata = data.result;
                else 
                    avdata = data.result.rows;
                avdata.id = avdata._id;
                tmp = avdata;
                success(avdata);
            };
        var getUrl = function(object) {
            if (!(object && object.url)) throw new Error("A 'url' property or function must be specified");
            return _.isFunction(object.url) ? object.url() : object.url;
        };

        // Default JSON-request options.
        var params = {
            url:          getUrl(model),
            type:         type,
            contentType:  'application/json',
            data:         modelJSON,
            dataType:     'json',
            processData:  false,
            success:      mysuccess,
            error:        error
        };
        
        console.log("Ajax req:"+params.type+":"+params.url);
        // Make the request.
        window.tmp = $.ajax(params);
    };
    // _.extend(, {

    //     // Save the current state of the **Store** to *localStorage*.
    //     save: function() {
    //         //localStorage.setItem(this.name, JSON.stringify(this.data));
    //     },

    //     // Add a model, giving it a (hopefully)-unique GUID, if it doesn't already
    //     // have an id of it's own.
    //     create: function(model) {
    //         // if (!model.id) model.id = model.attributes.id = guid();
    //         // this.data[model.id] = model;
    //         // this.save();
    //         // return model;
    //     },

    //     // Update a model by replacing its copy in `this.data`.
    //     update: function(model) {
    //         // this.data[model.id] = model;
    //         // this.save();
    //         // return model;
    //     },
        
    //     find: function(model) {
    //         var respackage = $.get(model.id),
    //         resobj = JSON.parse(respackage.responsetext);
    //             return resobj.result;
    //     },

    //     findAll: function(collection) {
    //         var respackage = $.get(collection.queryspec),
    //         resobj = JSON.parse(respackage.responsetext);
    //         return resobj.result.rows;
    //     },

    //     // Delete a model from `this.data`, returning it.
    //     destroy: function(model) {
    //         // delete this.data[model.id];
    //         // this.save();
    //         // return model;
    //     }

    // });

    // Backbone.sync = function(method, model, success, error) {

    //     var resp,
    //         getRecords = function(qspec) {
    //         },
    //         getRecord = function(
        
    //     if (typeof model === AvalonCollection) {
    //         switch (method) {
    //           case "read":    resp = store.findAll(model);                           break;
    //           case "create":  resp = store.create(model);                            break;
    //         }
    //     } else {
    //         switch (method) {
    //           case "read":    resp = store.find(model);                              break;
    //           case "create":  resp = store.create(model);                            break;
    //           case "update":  resp = store.update(model);                            break;
    //           case "delete":  resp = store.destroy(model);                           break;
    //         }
    //     }

    //     if (resp) {
    //         success(resp);
    //     } else {
    //         error("Record not found");
    //     }
    // };
});
