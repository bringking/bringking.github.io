---
layout: post
comments: true
title: "Lazy Model: An ngModel-ish binding handler for KnockoutJS"
slug: an-ngmodel-binding-handler-for-knockoutjs
published: true
date: 2014-03-09 16:40
comments: true
categories: [KnockoutJS,AngularJS,ngModel]
---

After spending some time building my first production Angular app (which is great), the  **[ngModel](http://docs.angularjs.org/api/ng/directive/ngModel)** directive struck me as being immediately useful, compared to the traditional KnockoutJS workflow. So I replicated some of the behavior with a "lazy model" binding handler.

<!-- more -->

##ngModel
The part that I found particuarly useful with ngModel is that it **creates** and exposes the model property to the UI for binding. Therefore, you can describe an observable model object that doesn't exist yet, and it will be created for you.

{% highlight html %}

 <div ng-controller="Ctrl">
 	<input ng-model="name" type="text" class="my-input" />
 </div>
 
{% endhighlight %}

{% highlight javascript %}

function Ctrl($scope) {
  //nothing here, but the name variable is created on the controllers $scope 
}

{% endhighlight %}
##Knockout
Comparing this to knockout, you can see that you have to do a little more work to achieve the same result.

{% highlight javascript %}

<input type="text" data-bind="value: name"/>

{% endhighlight %}

{% highlight javascript %}

var vm =  {
	name: ko.observable();
}
ko.applyBindings(vm);

{% endhighlight %}

My main problem with the Knockout way, is that I have to describe my bindable model object in two places now, the view and the Viewmodel. To bring a little simplification to this process, I created a new binding handler to handle the implicit creation for me. 
##Lazy Model
{% highlight javascript %}

<!-- ko model: {value:'name',target:model} -->
	<input type="text" data-bind="value: model.name"/>
<!-- /ko -->

<!-- ko model: {value:'address',target:model} -->
	<input type="text" data-bind="value: model.address"/>
<!-- /ko -->

{% endhighlight %}

{% highlight javascript %}

var vm =  {
	model:{} //empty model that view objects get lazily added to
}

{% endhighlight %}

In this example, you can think of the **model** object as being our **$scope**. Whenever you declare an observable to bind in the UI, it will get implicty created onto the model object as an observable value. In this way, you have only described your model properties in one place. An added bonus is a really clean viewmodel.

The best part about this particular implementation, is that is can even get complex, with property path syntax, e.g.

{% highlight javascript %}

<!-- ko model: {value:'name',target:model} -->
	<input type="text" data-bind="value: model.name"/>
<!-- /ko -->

<!-- ko model: {value:'address.city',target:model} -->
	<input type="text" data-bind="value: model.address.city"/>
<!-- /ko -->

<!-- ko model: {value:'address.zip',target:model} -->
	<input type="text" data-bind="value: model.address.zip"/>
<!-- /ko -->

{% endhighlight %}
 
This would result in an object that on the viewmodel that looks like - 

{% highlight javascript %}

model:{
	name: ko.observable(),
	address: {
		city: ko.observable(),
		zip: ko.observable()
	}
}

{% endhighlight %}

 What are the drawbacks with a pattern like this? This is most useful for simple form controls where you don't need to access advanced observable functions like extenders, or manual subscriptions. You could still do those things, but since your model properties are being lazily created, you would have to modify the method with another way to access the lazily created values. This could be something like a callback with the key and observable value to bind subscriptions to.
 
{% highlight html %}
     <!-- ko model: {value:'name',target:model,onCreate:created} -->
      <label for="name">Name</label>
      <input required type="text" data-bind="value:model.name, valueUpdate: 'keydown'"/>
    <!-- /ko -->
{% endhighlight %}
  
[Here](https://gist.github.com/bringking/9459485) is a gist of a working implementation, but feel free to modify and extend if you find it useful.