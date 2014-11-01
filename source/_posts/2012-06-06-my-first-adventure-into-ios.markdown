---
layout: post
title: "My first adventure into iOS"
date: 2012-06-06 18:28
comments: true
categories: 
- iOS
- objective c
- java
- c#
keywords: "iOS, Obj C, Objective C, Java, WP7, C#, UI, UI Design, mobile UI design, mobile, coding, coding in the basement, basement"
---

Today I started my porting the simplest app in my catalog over to iOS. The app is [Critter Cards- Toddler](http://www.windowsphone.com/en-us/apps/b474228c-e9d1-4fed-be5a-34025e52162b).
Admittedly, it is not a complex app, just flash cards with the ability to overwrite the built in narration with your own. So I need
a control for displaying a launcher of sorts to choose your deck, a control to navigate between cards and some pages to set settings. 

As of today I have completed the initial design of the front page of launcher icons for navigating around the app. So how did the process compare from
WP7 -> Android -> iOS? Let's take a look.

This is the look I wanted to achieve on each platform-

{% img center http://catalog.zune.net/v3.2/en-US/image/ee84b835-5258-4981-aad7-eda1bb46a049?width=1280&height=720&resize=true 240 400 %}

##WP7

Since this was the first platform I started on, I decided the launcher should be "metro" grid of tiles to choose your card deck.
This is where the power of [UIElements](http://msdn.microsoft.com/en-us/library/system.windows.uielement%28v=vs.95%29.aspx) and [DataTemplates](http://msdn.microsoft.com/en-us/library/ms742521.aspx) in SilverLight and WPF comes in handy, 
and made this task really simple. See below for an example-

<!-- more -->

{% codeblock [ lang:xml ] %}

<DataTemplate x:Key="tileItemsTemplate1">
            <ListBoxItem >
                <toolkit:ContextMenuService.ContextMenu >
                    <toolkit:ContextMenu Opened="ContextMenuOpened">
                        <toolkit:MenuItem Header="Delete Card Set" Click="DeleteCardSetClick"></toolkit:MenuItem>
                        <toolkit:MenuItem Header="Add Custom Card Set" Click="AddNewClick"/>
                        <toolkit:MenuItem Header="Edit Set" Click="EditSetClick"/>
                    </toolkit:ContextMenu>
                </toolkit:ContextMenuService.ContextMenu>
                <Button x:Name="button" Click="TileClick1" Style="{StaticResource ButtonStyle2}" BorderBrush="{x:Null}" toolkit:TiltEffect.IsTiltEnabled="True" Padding="-13" Foreground="Transparent">


                    <Grid >
                 

                        <Rectangle Height="234" Width="227" CacheMode="BitmapCache" Fill="{Binding TileColor,Converter={StaticResource ColorToBrushConverter}}"  Margin="0,1,-5,0" />
                        <Image Source="{Binding ImageUri}"  Stretch="None" CacheMode="BitmapCache" />
                        <TextBlock Text="{Binding Name}" FontSize="26" TextAlignment="Center" FontWeight="Bold" Foreground="White" FontFamily="Segoe WP Semibold" Height="35" Margin="0,200,-2,0" Width="224" />
                     
                    </Grid>


                </Button>
            </ListBoxItem>


<Listbox ItemsSource="{Binding Tiles}" ItemTemplate="{StaticResource tileItemsTemplate1}"  />

{% endcodeblock %}

As you can see I set a custom DataTemplate for the items contained in the ListBox. In the DataTemplate I defined a simple Button to obtain
the ButtonBase events, such as Click. Then I set the button's *content* to be a Grid containing a colored rectangle, an image
and a textblock. If you were maintaining multiple screens you could also accomplish this by setting all this data in a [custom style](http://msdn.microsoft.com/en-us/magazine/cc721611.aspx) for the button itself.
 When you get used to it, it is quite powerful and you can do some interesting things with overriding templates to create
custom UI elements. As you can see the ListBox ItemSource is data bound to a collection, and the ItemTemplate items are data bound as well.
This design allows for tiles to be added easily to the bound collection, requiring no changes to the UI template.
I will go into this in another post. Right now I just want to focus on the UI creation.

##Android

Now with Android I decided to go with a static layout defined in the similar-to-XAML, xml graphical layout
in Android. Why static? Well there is [no built in "Databinding"](http://www.stackoverflow.com/questions/6007941/android-data-binding-similar-to-wpf) in Android so I had a choice;
Statically create the layout in XML or create the layout in the code behind. I chose statically creating for the flexibility of 
seeing the design take shape in the extremely helpful "Graphical Layout" tab in an Eclipse android project. With this view, you can target 
the many different screen sizes in Android and see how your layout will look on those resolutions. Now, when I had my layout the way I wanted it,
I just hooked up an EventListener to the buttons and moved on. Not the most extensible solution as adding tiles would be a pain, but maybe when
I want to add a new cardset, I will go back and create the view in the code behind so it is more robust.  Here is an example of the layout-

{% codeblock [ lang:xml ] %}

<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="fill_parent"
    android:layout_height="fill_parent"
    android:orientation="vertical"
    android:id="@+id/mainLinear"
    >

           <ScrollView
        android:layout_width="fill_parent"
        android:layout_height="0dp"
        android:layout_weight="1"
        android:scrollbars="none"
        android:id="@+id/scrollViewMain"
        > 
        
       <TableLayout  android:layout_width="fill_parent" android:layout_height="wrap_content" android:orientation="vertical" android:id="@+id/maintable">"

      
        
        <TableRow android:layout_width="fill_parent" >

            <ImageButton
                android:contentDescription="@string/desc"
                android:id="@+id/btnDesert"
                android:layout_width="180dp"
                android:layout_height="180dp"
                android:layout_weight="1"
                android:padding="10dp"
                android:scaleType="fitCenter"
                android:src="@drawable/desert" 
                android:onClick="ClickHandler"
                />

            <ImageButton
                android:contentDescription="@string/desc"
                android:id="@+id/btnSavanna"
                android:layout_width="180dp"
                android:layout_height="180dp"
                android:layout_weight="1"
                android:padding="10dp"
                android:scaleType="fitCenter"
                android:src="@drawable/savanna"
                android:onClick="ClickHandler" />
        </TableRow>
        </TableLayout>
        </ScrollView>

{% endcodeblock %}

In the code behind there is the requisite 10 item switch-case (ugh) that gets the ID of the sending ImageButton, and passes that context to the CritterCardsPage activity and opens the
CritterCardsPage activity. 

{% codeblock [ lang:java ] %}

public void ClickHandler(View v)
    {
    	Intent nav = null;
    	
    	switch(v.getId())
    	{
    	case R.id.btnDesert:
    		   
    	        nav = new Intent(CritterCardsAnimalsActivity.this,CritterCardsPage.class);
    	       nav.putExtra("set", CardType.DESERT);
    	
    		break;
    	case R.id.btnSavanna:
    		 nav = new Intent(CritterCardsAnimalsActivity.this,CritterCardsPage.class);
 	       nav.putExtra("set", CardType.SAVANNA);
 	     
    		
    		break;
    	case R.id.btnArctic:
    		 nav = new Intent(CritterCardsAnimalsActivity.this,CritterCardsPage.class);
 	       nav.putExtra("set", CardType.ARCTIC);
 	      
    		break;
    	case R.id.btnRainforest:
    		 nav = new Intent(CritterCardsAnimalsActivity.this,CritterCardsPage.class);
 	       nav.putExtra("set", CardType.RAINFOREST);
 	   
    		break;
    	case R.id.btnForest:
    		 nav = new Intent(CritterCardsAnimalsActivity.this,CritterCardsPage.class);
 	       nav.putExtra("set", CardType.FOREST);
 	  
    	
    		break;
    	case R.id.btnUnderwater:
    		 nav = new Intent(CritterCardsAnimalsActivity.this,CritterCardsPage.class);
 	       nav.putExtra("set", CardType.UNDERWATER);
 	       
    			break;
    	
	       
    	case R.id.btnRandom:
    		 nav = new Intent(CritterCardsAnimalsActivity.this,CritterCardsPage.class);
 	       nav.putExtra("set", CardType.RANDOM);
   		 
    		break;
    		
    	case R.id.btnSupport:
   		 nav = new Intent(CritterCardsAnimalsActivity.this,SupportPage.class);
	    	break;
	    	
    	case R.id.btnSettings:
      		 nav = new Intent(CritterCardsAnimalsActivity.this,SettingsPage.class);
   	    	break;
	    	
    	}
    	if(nav != null)
    	{
    	       startActivity(nav);
    	}
 

{% endcodeblock %}

So Android and WP7 should see nice and familiar to anyone who is comfortable with web development and CSS styling. All the same concepts are used,
fixed width elements, dynamic width elements, nesting elements etc. Powerful and straight forward (for me at least), however in this case
not optimal. 



##iOS
So moving to iOS represented in one way a step back in ease of use for creation of a UI. No more XML based UI design, no more similarities to 
web development. You can either create the UI at runtime in your ViewController or create it in the Interface Builder with a WinForms like 
drag and drop interface. For beginners to programming this style is welcome and presents a low entry barrier to designing a UI, however
for me it felt like a step back. I am new to iOS but not new to programming, so I was looking for the more powerful ways to create the interface, and
left wanting. So, to create my "metro" grid in iOS I had to resort to doing it in code with the ViewController. Not that this is bad by any means,
in fact IMHO it is more robust than my Android solution, however compared to Silverlight and WPF, the same effect in iOS results in a much larger chunk of code.
Now take this section as my first attempt, this is what I came up with after my first few hours of iOS programming. I could come across a better way 
as I become more familiar. If that happens I will surely update here. This solution started with the example at [Cone Code](http://www.conecode.com/news/2012/05/ios-how-to-create-a-grid-of-uibuttons/)


So it starts with the ViewController.h and adding a multi-dimensional array to store the button locations

{% codeblock ViewController.h [ lang:objc ]  %}

#import <UIKit/UIKit.h>


#define kButtonColumns 2
#define kButtonRows 5

@interface ViewController : UIViewController
{
    
    UIButton *buttons[kButtonColumns][kButtonRows];
}


@end

{% endcodeblock %}

Next code to create the "Tiles" in the implementation.

{% codeblock ViewController.m [ lang:objc ]  %}

#import "ViewController.h"
#import <QuartzCore/QuartzCore.h>
#import "Tile.h"

@interface ViewController ()

@end

@implementation ViewController

- (void)viewDidLoad
{
    [super viewDidLoad];
	// Do any additional setup after loading the view, typically from a nib.
    
    //get the device screen size and set the UIScrollView height to allow for 5 tiles that are one third the height of the screen. 
    //Thus allowing for 3 tiles on the screen and 2 off.
    CGRect screenRect = [[UIScreen mainScreen] bounds];
    UIScrollView *tempScrollView=(UIScrollView *) self.view;
    tempScrollView.contentSize = CGSizeMake(screenRect.size.width , (screenRect.size.height / 3) * 5);
    
    //call the placeTile method
    [self placeTiles];
}


{% endcodeblock %}

To store the data for the tiles I created a custom class called tile. Tile holds three properties,
an image, a title and a color. It also implements an initialization method (I miss object initializers in C#) to pass in 
the values on init.

{% codeblock Tile.h [ lang:objc ]  %}

#import <Foundation/Foundation.h>

@interface Tile : NSObject

@property (retain) UIImage * tileImage;
@property(retain) NSString * tileTitle;
@property(retain) UIColor * tileColor;


-(id)initWithImage: (UIImage *)image andTitle:(NSString *)title andColor:(UIColor *)color;
@end

{% endcodeblock %}

Here is the implementation

{% codeblock Tile.m [ lang:objc ]  %}

#import "Tile.h"

@implementation Tile

@synthesize tileColor;
@synthesize tileImage;
@synthesize tileTitle;

-(id)initWithImage:(UIImage *)image andTitle:(NSString *)title andColor:(UIColor *)color
{
    if(self = [super init])
    {
        self.tileColor = color;
        self.tileImage = image;
        self.tileTitle = title;
        
        
    }
    return self;
}

@end


{% endcodeblock %}

So now that I have my tile object, I created a method in the ViewController.m to initialize an
NSArray of tiles to use in the placeTiles method.


{% codeblock ViewController.m [ lang:objc ]  %}

-(NSArray *)getTiles
{
    NSArray *tiles;
    
    tiles = [NSArray arrayWithObjects:
             [[Tile alloc] initWithImage:[UIImage imageNamed:@"shapes"] andTitle:@"Shapes" andColor:[UIColor colorWithRed:255/255.0 green:0/255.0 blue:254/255.0 alpha:1]], 
             
             [[Tile alloc] initWithImage:[UIImage imageNamed:@"cow2"] andTitle:@"Animals" andColor:[UIColor colorWithRed:255/255.0 green:0/255.0 blue:0/255.0 alpha:1]],
             
             [[Tile alloc] initWithImage:[UIImage imageNamed:@"abc"] andTitle:@"ABC" andColor:[UIColor colorWithRed:0/255.0 green:128/255.0 blue:1/255.0 alpha:1]],
             
             [[Tile alloc] initWithImage:[UIImage imageNamed:@"truck_tanks4"] andTitle:@"Things that Go" andColor:[UIColor colorWithRed:129/255.0 green:0/255.0 blue:127/255.0 alpha:1]],
             
             [[Tile alloc] initWithImage:[UIImage imageNamed:@"numbers1"] andTitle:@"Numbers" andColor:[UIColor colorWithRed:0/255.0 green:0/255.0 blue:254/255.0 alpha:1]],
             
             [[Tile alloc] initWithImage:[UIImage imageNamed:@"food"] andTitle:@"Food" andColor:[UIColor colorWithRed:0/255.0 green:255/255.0 blue:255/255.0 alpha:1]],
             
             [[Tile alloc] initWithImage:[UIImage imageNamed:@"colors"] andTitle:@"Colors" andColor:[UIColor colorWithRed:255/255.0 green:165/255.0 blue:0/255.0 alpha:1]],
             
             [[Tile alloc] initWithImage:[UIImage imageNamed:@"world1"] andTitle:@"Around the World" andColor:[UIColor colorWithRed:108/255.0 green:183/255.0 blue:189/255.0 alpha:1]],
             
             [[Tile alloc] initWithImage:[UIImage imageNamed:@"random1"] andTitle:@"Random" andColor:[UIColor colorWithRed:165/255.0 green:43/255.0 blue:42/255.0 alpha:1]],
             
             [[Tile alloc] initWithImage:[UIImage imageNamed:@"support"] andTitle:@"Support" andColor:[UIColor colorWithRed:169/255.0 green:169/255.0 blue:169/255.0 alpha:1]], nil];
    
    
    
         
    return tiles;
}

{% endcodeblock %}

And finally I have a the placeTiles method. This is where it all comes together. This method steps trough the 
array and adds the tiles to the view. 

{% codeblock ViewController.m [ lang:objc ]  %}
-(void)placeTiles
{
    //button width set to half screen size and height to a third of the screen size
    CGRect screenRect = [[UIScreen mainScreen] bounds];
    CGFloat tileWidth = screenRect.size.width / 2;
    CGFloat tileHeight = screenRect.size.height / 3;
    
   
    NSInteger intXSpacing = tileWidth;
    NSInteger intYSpacing = tileHeight;
    NSInteger intTagNumber = 0;
    NSInteger intXTile;
    NSInteger intYTile;
    
    
    //get tiles that will represent the button data
    int tileCount =0;
    NSArray *tiles = [self getTiles];
    Tile *tile;
    
    for(int y = 0; y < kButtonRows; y++)
    {
        for(int x = 0; x < kButtonColumns; x++)
        {
            intXTile = (x * intXSpacing);
            intYTile = (y * intYSpacing);
            
            
            //get reference to a tile
            tile = [tiles objectAtIndex:tileCount];
                        
            //create new button and set its frame with the tileWidth TileHeight and its x and y location
            buttons[x][y] = [UIButton buttonWithType:UIButtonTypeCustom];            
            [buttons[x][y] setFrame:CGRectMake(intXTile, intYTile, tileWidth, tileHeight)];
            
            //set the button imageView to fit the tile image within the Aspect Ratio then set the image to the tile.tileImage
             buttons[x][y].imageView.contentMode = UIViewContentModeScaleAspectFit;
            [buttons[x][y] setImage:tile.tileImage forState:UIControlStateNormal];
            
            //add a TouchDown target 
            [buttons[x][y] addTarget:self action:@selector(actionPick:) forControlEvents:UIControlEventTouchDown];
            
            //
            buttons[x][y].adjustsImageWhenHighlighted = NO;
            buttons[x][y].adjustsImageWhenDisabled = NO;
            
            //set button Tag
            buttons[x][y].tag = intTagNumber;
       
           
            //set background color
            [buttons[x][y] setBackgroundColor:tile.tileColor];
            
            
            //add to view
             [self.view addSubview:buttons[x][y]];
            
            //get ready for next iteration- increment tagNumber and tileCount
             intTagNumber++;            
            tileCount++;
             
             
            
        }
        
    }
    
}

{% endcodeblock %}

So what have I learned so far? Compared to the MVVM pattern with WP7, off the self without creating your own 
data binding solution in iOS or Android, creating a UI takes a significant amount more code in iOS and Android both. I will keep 
posting as I get further along in the app. Next up will be the creation of the "Card deck" or gallery.

Also, check out this [MVVM library](http://www.codeproject.com/Articles/166952/MVVM-in-Android) for Android. Could bring some MVVM goodness to Android. 

