---
layout: post
title: "Reusable UI controls with KnockoutJS"
date: 2014-01-18 19:39:59 -0700
comments: true
categories: knockoutjs, DRY
---


When developing large applications, it's best practice to use some level of the [DRY](http://en.wikipedia.org/wiki/Don't_repeat_yourself) principle, and attempt to create reusable modules, components, and code wherever possible. Unfortunately, adhering to this principle with KnockoutJS it not as straight-forward as it could be.

<!-- more -->

## The problem

The problem.. well it's not really a problem, it's just the way KnockoutJS was designed. KnockoutJS is more of a library for doing [MVVM](http://en.wikipedia.org/wiki/Model_View_ViewModel), than a framework that has opinions on how you re-use your code. There are a few frameworks out there that attempt to solve this issue, and do it very well. 

- [Durandal](http://durandaljs.com/) is a great framework that builds on Knockout to provide things like [modules](http://durandaljs.com/documentation/Creating-A-Module/), [views](http://durandaljs.com/documentation/Creating-A-View/) and a router. It is really more comparable to AngularJS or Ember, than to vanilla Knockout.
- [Falcon.js](http://stoodder.github.io/falconjs/) Falcon is a relative newcomer, and admittedly  I have not used it, but it introduces Objects, Models and Views to help give Knockout some structure.

However, what if you are already invested in a large vanilla Knockout codebase and don't want to introduce a new framework? You can use some clever binding handlers.

## Reusable binding handlers

Using Knockout's [bindingHandlers](http://knockoutjs.com/documentation/custom-bindings.html) and in-line [template](http://knockoutjs.com/documentation/template-binding.html) engine, you can generate reusable UI controls that are fully portable, and can be introduced into any viewmodel.  

To demo this, lets put together a simple hierarchical tree-view, that can be given a set of JSON, display it and track selections. Start with the bindingHandler that is appropriately called **treeView**. 

{% highlight javascript %}
      ko.bindingHandlers.treeView = {
        init: function(element, valueAccessor) {
          //style element
          element.className = "ko-treeview-container";
          
           //let this handler control its descendants. 
           return { controlsDescendantBindings: true };
        }
      };
{% endhighlight %}

In this block, we have the initialize function for the bindingHandler that will run when Knockout binds to the View. The key to making this bindingHandler reusable, is the return value. **controlsDescendantBindings: true** tells Knockout to stop the parent context from trying to bind against this elements children, giving our bindingHandler full control over its bound element. The Knockout [documentation](http://knockoutjs.com/documentation/custom-bindings-controlling-descendant-bindings.html) goes over this in more detail. Also, I am adding a CSS class to the bound container at runtime, so it can be controlled with an included stylesheet.

Next lets add some options to the valueAccessor, to build the API that you will use to control the element.

{% highlight javascript %}

          var options = valueAccessor();
          if ( !options.data ) {
            throw new Error("ko.bindingHandlers.treeView: No data to display");
          } 
          
          //extend options with search
          options.search = ko.observable("");
      
          //set default data values
          if (!options.label) options.label = 'id';
          if (!options.childNode) options.childNode = 'children';

{% endhighlight %}

We get a reference to the valueAccessor() and add an observable **options.search** to allow the user to filter the view by keyword. Also, we allow the user to pass in the value of the **label** (this will serve as a unique id for the node) for each tree node, and the property **childNode** to specify the object property to search for child nodes. With this we have enough information to build the UI.

{% highlight javascript %}
        createNodes: function(rootElement, options){
        
     //Root node template containing a list of the top level nodes in the data set
     var rootTmpl = '<script id="ko-treeview-root-tmpl"><div class="navbar"><p class="brand" data-bind="text:$data.title">Title</p><div class="container"><form class="navbar-form pull-right col-sm-4"><div class="input-append"><input class="span4" type="text" placeholder="Search" data-bind="value:$data.search, valueUpdate: \'afterkeydown\'"/><span class="add-on"><i class="icon-search"></i></span></div></form></div></div><ul class="ko-treeview-list" data-bind="template:{foreach:$data.data,name:\'ko-treeview-node-tmpl\'}"></ul></script>';
     
     //the template to display each node, notice the recursive template binding with UL
     var nodeTmpl = '<script id="ko-treeview-node-tmpl"><li class="ko-treeview-listitem"><div data-bind="template:{name:\'ko-treeview-item-tmpl\',data:$data}"></div><ul class="ko-treeview-list" data-bind="template:{name:\'ko-treeview-node-tmpl\',foreach:$data[$root.childNode]}"></div></li></script>';
     
     //the item inside the node, a checkbox and a label.
     var itemTmpl ='<script id="ko-treeview-item-tmpl"><div data-bind="visible:$data[$root.label].indexOf($root.search()) > -1"><input type="checkbox" class="ko-treeview-cb" data-bind="checked: $root.selected, attr:{value:$data[$root.label], id:$data[$root.label]}"  /><label  class="ko-treeview-label" data-bind="text:$data[$root.label], attr:{for:$data[$root.label]}"></label></div></script>'
     
      //append templates
       if ( !document.getElementById('ko-treeview-root-tmpl') ) {
           document.body.insertAdjacentHTML('beforeend', rootTmpl);
       }
       if ( !document.getElementById('ko-treeview-node-tmpl') ) {
           document.body.insertAdjacentHTML('beforeend', nodeTmpl);
       }
       if ( !document.getElementById('ko-treeview-item-tmpl') ) {
           document.body.insertAdjacentHTML('beforeend', itemTmpl);
       }
       
       //apply first binding
       ko.applyBindingsToNode(rootElement,{template:{name:"ko-treeview-root-tmpl"}},options);
      
  }
     
{% endhighlight %}

There is a lot that I just added there, but the heavy lifting of the **createNodes** function is all done by Knockout's template engine. In this case, the templates are the outer list, each node, and the items in the node. The most important piece for the treeView; is the node template. The node template is recursively generating any child items the node contains.  Finally, we need to apply the template binding to the rootElement using **ko.applyBindingsToNode.** ko.applyBindingsToNode allows us to specify bindings to an element, and the context for those bindings. 


{% highlight javascript %}

        //create the tree
         ko.bindingHandlers.treeView.createNodes(element,options);
         valueAccessor().data.subscribe(function(){
          ko.bindingHandlers.treeView.createNodes(element,options);
        });

{% endhighlight %}

Finally, we can finish up by running the **createNodes** function on init, and subscribing to the data set to refresh the treeView if the data changes. Let's see the final product.

{% highlight javascript %}
     ko.bindingHandlers.treeView = {
        createNodes: function(rootElement, options){
        
     //Root node template containing a list of the top level nodes in the data set
     var rootTmpl = '<script id="ko-treeview-root-tmpl"><div class="navbar"><p class="brand" data-bind="text:$data.title">Title</p><div class="container"><form class="navbar-form pull-right col-sm-4"><div class="input-append"><input class="span4" type="text" placeholder="Search" data-bind="value:$data.search, valueUpdate: \'afterkeydown\'"/><span class="add-on"><i class="icon-search"></i></span></div></form></div></div><ul class="ko-treeview-list" data-bind="template:{foreach:$data.data,name:\'ko-treeview-node-tmpl\'}"></ul></script>';
     
     //the template to display each node, notice the recursive template binding with UL
     var nodeTmpl = '<script id="ko-treeview-node-tmpl"><li class="ko-treeview-listitem"><div data-bind="template:{name:\'ko-treeview-item-tmpl\',data:$data}"></div><ul class="ko-treeview-list" data-bind="template:{name:\'ko-treeview-node-tmpl\',foreach:$data[$root.childNode]}"></div></li></script>';
     
     //the item inside the node, a checkbox and a label.
     var itemTmpl ='<script id="ko-treeview-item-tmpl"><div data-bind="visible:$data[$root.label].indexOf($root.search()) > -1"><input type="checkbox" class="ko-treeview-cb" data-bind="checked: $root.selected, attr:{value:$data[$root.label], id:$data[$root.label]}"  /><label  class="ko-treeview-label" data-bind="text:$data[$root.label], attr:{for:$data[$root.label]}"></label></div></script>'
     
      //append templates
       if ( !document.getElementById('ko-treeview-root-tmpl') ) {
           document.body.insertAdjacentHTML('beforeend', rootTmpl);
       }
       if ( !document.getElementById('ko-treeview-node-tmpl') ) {
           document.body.insertAdjacentHTML('beforeend', nodeTmpl);
       }
       if ( !document.getElementById('ko-treeview-item-tmpl') ) {
           document.body.insertAdjacentHTML('beforeend', itemTmpl);
       }
       
       //apply first binding
       ko.applyBindingsToNode(rootElement,{template:{name:"ko-treeview-root-tmpl"}},options);
      
  },
        init: function(element, valueAccessor) {
          //style element
          element.className = "ko-treeview-container";
          
          var options = valueAccessor();
          if ( !options.data ) {
            throw new Error("ko.bindingHandlers.treeView: No data to display");
          } 
          
          //extend options with search
          options.search = ko.observable("");
      
          //set default data values
          if (!options.label) options.label = 'id';
          if (!options.childNode) options.childNode = 'children';
       
           
        //create the tree
         ko.bindingHandlers.treeView.createNodes(element,options);
         valueAccessor().data.subscribe(function() {
          ko.bindingHandlers.treeView.createNodes(element,options);
        });
                
          
          //let this handler control its descendants. 
          return { controlsDescendantBindings: true };
        }
      };
{% endhighlight %}

Now that we made this bindingHandler reusable, it can be bound to a container element, passed the appropriate data, and it will do the rest (except styling, but that can be addressed in a few different ways). You would use this handler like-

{% highlight html %}
  <div data-bind="treeView:{selected:selectedNodes, data:data}"> 
  </div>
{% endhighlight %}
{% highlight javascript %}
function vm(){
  this.selectedNodes = ko.observableArray([]);
  
  this.data = ko.observableArray([
    {
     id:"Level 1",
      children:[
        {id:"Level 1-1",children:[
          {id:"Level 1-1-1",children:[
            {id:"Level 1-1-1-1"}
          ]}
        ]},
        {id:"Level 1-2"},
      ]
    },
         {
     id:"Level 2",
      children:[
        {id:"Level 2-1",children:[
          {id:"Level 2-1-1"}
        ]},
        {id:"Level 2-2"},
      ]
    },
    
  ]);

}
var myVM = new vm();    
ko.applyBindings(myVM);

{% endhighlight %}

Here is a working [JSBin](http://jsbin.com/Awipoku/14/edit) of the finished result. What makes this pattern so nice, is it not only removes the handler behavior from the VM, but also the handlers views and templates from the VM. This results in a nicely modular UI component. 

