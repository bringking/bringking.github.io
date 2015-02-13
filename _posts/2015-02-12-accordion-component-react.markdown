---
layout: post
comments: true
title: "Creating an Accordion component in ReactJS: Part 1"
slug: react-accordion
published: true
date: 2015-02-12 11:30
comments: true
category: Programming
tags: [ReactJS,Components,Javascript,JSX,react-animate]
---

For a new project I am working on, I needed to create an Accordion control using ReactJS. Despite how I feel about the user
experience for Accordions, I needed to get this built. The foundation for this control is a library called
[react-animate](https://github.com/elierotenberg/react-animate).
<!-- more -->

So the goal is a control that behaves like you see below, which is a pretty standard accordion.

![Accordion](/images/accordion.gif)

I wanted to be able to pass arbitrary contents to the accordion panels, and have those operate independently of what
the accordion container is doing. Given this, I expose a few options to pass in via props from whatever component will
host the accordion.


{% highlight javascript %}
render: function() {

        //generate an arbitrary set of nested controls
        var items = [{header:<span>Item header</span>,content:<h1>Item 1</h1>}, {header:<span>Item header</span>,content:<h1>Item 2</h1>}];

        //render content
        return (
            <div>
                //create a new Accordion
                //accept a className override for the container and the individual items
                <Accordion items={items} className="test" itemClassName="test-item" />
            </div>
        );
    }
{% endhighlight %}

Now the accordion's responsibilities are to display this content in a list, and track whether each item is expanded or
collapsed. Pretty straight forward, so let's create the React class.

{% highlight javascript %}
var React = require('react/addons');
var AnimateMixin = require('react-animate');

/**
 * Accordion object that maintains a list of content containers and their collapsed or expanded state
 * @type {*|Function}
 */
var Accordion = React.createClass({
    /**
     * Mixin the AnimateMixin
     */
    mixins: [AnimateMixin]
});

module.exports = Accordion;
{% endhighlight %}

We know we need to animate the opening and closing of the items, so we need to bring in our react-animate dependency, as
a mixin, and add it to the mixins array. Next we can define our initial state.

{% highlight javascript %}
/**
 * Get the initial state
 * @returns {{itemMap: {}}}
 */
getInitialState: function() {

    //map items and their initial states
    var itemMap = this.props.items.map(function( i, idx ) {
        return {
            animating: false,
            open: idx === 0,
            content:i.content,
            header:i.header
        };
    });

    return {
        itemMap: itemMap
    }

},
{% endhighlight %}

In this naive implementation, we will just assume that every time the component is mounted, the first item in the set
will be open. So, we create a indexed map of each item, and track two properties *animating* and *open*. These two
properties should encapsulate the possible states each accordion item can be in. So next we need to define how these to
change these states. That is where the *toggle* function comes in.
{% highlight javascript %}
    /**
     * Get the clientHeight of the parent element from a triggered event
     * @param event
     * @returns {number}
     */
    getParentHeight: function( event ) {
        return event.target.parentNode.clientHeight;
    },
    /**
     * Get the scrollHeight of the parent element from a trigger event
     * @param event
     * @returns {number}
     */
    getParentScrollHeight: function( event ) {
        return event.target.parentNode.scrollHeight;
    },
    /**
     * Event handler for clicking on an accordion header
     * @param idx
     * @param event
     */
    toggle: function( idx, event ) {
        var _this = this, currentHeight = this.getParentHeight(event),
            scrollHeight = this.getParentScrollHeight(event), newHeight,
            itemMap = this.state.itemMap;

        //toggle animation for this item
        itemMap[idx].animating = true;
        this.setState({itemMap: itemMap});

        //choose the right the new height
        newHeight = currentHeight >= 25 ? "25px" : scrollHeight + "px";

        //send off to the animation library mixin, which exposes the this.animate function
        this.animate(
            idx + "toggle",
            {height: currentHeight + "px"},
            {height: newHeight},
            250,
            {
                //when it's done, toggle animating bool
                onComplete: function() {
                    var newMap = _this.state.itemMap;
                    newMap[idx].animating = false;
                    newMap[idx].open = newHeight !== "25px";
                    _this.setState({itemMap: newMap});
                }
            }
        );

    },
{% endhighlight %}

So that is a lot to take in, but in a nutshell, on click this function does the following-

- Gets the height the internal content [Element.scrollHeight](https://developer.mozilla.org/en-US/docs/Web/API/Element.scrollHeight)
*including* content hidden by overflow
- Gets the current height of the *not including* the overflow using [Element.clientHeight](https://developer.mozilla.org/en-US/docs/Web/API/Element.clientHeight)
- Sets the *state.itemMap[idx].animating* to *true* to indicate that this item is about to be animated
- Calculates the newHeight based on it's current height
- Triggers the react-animation animation with the new values.
- On complete, grab the item from the map again, and toggle animation to false, and set the open flag.

So now we can tie this all together in our render function.

{% highlight javascript %}
    /**
     * Define our default header style
     * @returns {{height: string, backgroundColor: string, cursor: string}}
     */
    getItemHeaderStyle: function() {
        return {
            height: "25px",
            backgroundColor: "#f9f9f9",
            cursor: "pointer"
        };
    },
    /**
     * Render
     * @returns {XML}
     */
    render: function() {
         var _this = this;
         var items = this.props.items;

         //add the content to the accordion container
         var contents = items.map(function( i, idx ) {

             //calculate the current style
             var itemStyle = _this.getDefaultItemStyle();
             if ( _this.state.itemMap[idx].animating ) {
                 itemStyle.height = _this.getAnimatedStyle(idx + "toggle").height;
             } else {
                 itemStyle.height = _this.state.itemMap[idx].open ? "auto" : "25px"
             }

             return <div style={itemStyle} className={_this.props.itemClassName} key={idx}>
                 <div style={_this.getItemHeaderStyle()} onClick={_this.toggle.bind(_this, idx)}>
                      {i.header}
                 </div>
                     {i.content}
             </div>
         });

         return (
             <div className={this.props.className}>
                 {contents}
             </div>
         );
    }
{% endhighlight %}

The most important part of this function, is the *_this.getAnimatedStyle()* call inside the item map function. This call
returns the inline styles to be applied to the element during an animation. So the meat of the logic is to check if
the element should be animating, and if so, grab the animated style. If not, then just maintain your current height by
setting *height:"auto"* or *height:"25px"*

Tying it all together, we get something that works like this-

![Accordion](/images/reactAccordion.gif)

There we have it, an accordion control built in ReactJS. The API for this is still pretty sparse, but the core interaction is there.
Stay tuned for part 2, and we can add more features. If you want to see the full code for this, you can find
it [here](https://gist.github.com/bringking/2a2f4469d8c60fe1a347).