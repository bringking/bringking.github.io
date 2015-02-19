---
layout: post
comments: true
title: "Running Fortify 4.12 on an ASP.net MVC or Web Api 2 project"
slug: run-fortify-on-asp-mvc
published: true
date: 2015-01-23 11:30
comments: true
category: Programming
tags: [ASP.net,Visual Studio 2013,Web Api 2,MVC,Fortify,Static analysis]
showMore: true
---

So I was recently asked by en enterprise security team to run some static analysis on our backend ASP.net project. That turned
into an exercise in frustration since all the documentation was written assuming the project you are scanning is an ASP.net website.
It doesn't take into account the differences in an MVC or Web Api 2 application. The gist of it, is that Fortify expects
your application to be pre-compiled and placed into the .NET ASP.net temporary files folder, which MVC and Web API projects don't do.

<!-- more -->

So in order to run the scan successfully, to run the scan do the following

## Modify fortify properties file

Open up {Fortify_install_dir}\Core\config\fortify.properties and uncomment the following:

{% highlight yaml %}
           com.fortify.VS.SkipASPPrecompilation=true
{% endhighlight %}

and also, set the following property to false (Default value is true).

{% highlight yaml %}
     com.fortify.VS.RequireASPPrecompilation=false
{% endhighlight %}

## Build your project

Build your project as normal in Visual studio

## Copy build artifacts

Copy the build artifacts from the /bin directory at the root of your project to the following location -

{% highlight yaml%}
C:\Windows\Microsoft.NET\Framework\{frameworkverion}\Temporary ASP.NET Files\{yourprojectname}
{% endhighlight %}

So for a project named "YourProject.Web" that build against .NET 4 or 4.5, the path would look like this-

{% highlight yaml%}
C:\Windows\Microsoft.NET\Framework\v4.0.30319\Temporary ASP.NET Files\YourProject.Web
{% endhighlight %}

## Run the scan

You can now run the Fortify scan from the Visual Studio toolbar
![I have no idea what I am doing](/images/fortify.png)

It should be noted that you are technically running the scan against the previously generated artifacts, so if you change your
code after you copy the artifacts, the results will be skewed.