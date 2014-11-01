---
layout: post
title: "Paginated view on WP7"
date: 2012-07-23 07:41
comments: true
categories: 
- c# 
- WP7
- controls
- lazy-loading
- Pivot
- Panorama
---

What I wanted to detail in these upcoming posts was how I implemented a paginated view for the "card deck" on each platform. To sum it up, Android and iOS 
provided better better controls out of the box to implement this functionality. Windows Phone 7 was kind of a pain so we will start with that first. So what was the end goal? The
end goal was a fluid image-gallery type experience that allowed users to swipe through the cards with touch rather than buttons. This 
type of functionality is extremely common on mobile apps so I imagined there would be built in controls in the frameworks. Well I was half right..  

<!-- more -->

##WP7 Pivot
Windows Phone 7 has no obvious choice for this control, however with some template modification, I ended up using the [Pivot](http://msdn.microsoft.com/en-us/library/microsoft.phone.controls.pivot(v=vs.92.aspx). 
The pivot control is a common element in metro style apps. The great thing about the pivot control is it inherits from ItemsControl,
which gave me all the properties and events that I need to get the functionality, most importantly the SelectedItem property and LoadedPivotItem and UnloadedPivotItem events.

{% codeblock [ lang:xml ] %}
<phone:PhoneApplicationPage.Resources>
	<Style x:Key="PivotItemStyle1" TargetType="controls:PivotItem">
		<Setter Property="Template">
			<Setter.Value>
				<ControlTemplate TargetType="controls:PivotItem">
					<Grid>
						<Grid.RowDefinitions>
							<RowDefinition Height="Auto"/>
							<RowDefinition Height="*"/>
						<Grid.RowDefinitions/>
					<Image Source="{Binding ImageUri}" Stretch="Uniform" Height="630" Grid.Row="0"/>
					<TextBlock Text={"Binding Name}" FontFamily="Segoe WP Semibold" Grid.Row="1" />
					</Grid>
				</ControlTemplate>
			</Setter.Value>
		</Setter>
	</Style>
</phone:PhoneApplicationPage.Resources>

<controls:Pivot ItemsSource={"Binding CardList"} LoadedPivotItem="MainPivotLoadedPivotItem" UnloadedPivotItem="MainPivotUnloadedPivotItem"  ItemContainerStyle={"StaticResource PivotItemStyle1}"/>
{% endcodeblock %}

So the layout code is fairly simple, a pivot control whose ItemsSource is databound to your viewmodel, and implements a custom style to get the layout the way you want it and binds the items to the viewmodel.
So in your code you can subscribe to the LoadedPivotItem and UnloadedPivotItem events to access your Items every time the user changes the cards

{% codeblock [ lang:csharp ] %}
public CardPage()
{
	//apply datacontext to the page to bind to my viewmodel.
	this.DataContext = App.ViewModel;
}

private void MainPivotLoadedItem(object sender, PivotItemEventArgs e)
{	
	//get reference to control
	var pivot = sender as Pivot();
	
	if(pivot == null) return; 
	
	//get reference to SelectedItem as cast as my bound object
    var card = pivot.SelectedItem as CardModel;
		
	//do some stuff if required. In my case, play a sound effect and narration file
	if(card !=null) card.PlaySound();
	
}

private void MainPivotUnLoadedItem(object sender, PivotItemEventArgs e)
{
	//get reference to control
	var pivot = sender as Pivot();
	
	if(pivot == null) return;
	 
	//get reference to SelectedItem as cast as my bound object
	var card = pivot.SelectedItem as CardModel;
	
	//do some stuff if required. In my case, stop any playing sound as card is was unloaded
	if(card != null) card.KillSounds();
}
{% endcodeblock %}

###Pivot problems

In the end this solution is nice for its simplicity. First, the pivot control doesn't provide the experience you would expect from
this type of application. Each item that is not in view is hidden, so without a header each item just kind of appears and animates into view. Secondly, the first problem 
is exaggerated since the Pivot control does not support dragging, which I found out is highly annoying to some users. See the video below for an example of 
what I am talking about. 

{% youtube nFPv0JQqKkk %}


###Panorama
So after some a few hours of racking my brain trying to create my own control by sub-classing ListBox, or adding to ScrollViewer with a
StackPanel, I realized that another Microsoft.Phone.Controls class did exactly what I needed; the Panorama. Again, the Panorama required some templating
to get the look layout I was after.

{% codeblock [ lang:xml ] %}
 
<phone:PhoneApplicationPage.Resources>
   <Style x:Key="PanoramaStyle1" TargetType="controls:Panorama">
        <Setter Property="ItemsPanel">
          <Setter.Value>
            <ItemsPanelTemplate>
              <controlsPrimitives:PanoramaPanel x:Name="panel" />

            </ItemsPanelTemplate>
          </Setter.Value>
        </Setter>
        <Setter Property="Foreground" Value="{StaticResource PhoneForegroundBrush}" />
        <Setter Property="Background" Value="Transparent" />
        <Setter Property="Template">
          <Setter.Value>
            <ControlTemplate TargetType="controls:Panorama">
              <Grid>
                <Grid.RowDefinitions>
                  <RowDefinition Height="1" />
                  <RowDefinition Height="*" />
                </Grid.RowDefinitions>
                <controlsPrimitives:PanningBackgroundLayer x:Name="BackgroundLayer"
                                                           HorizontalAlignment="Left" Grid.RowSpan="2">
                  <Border x:Name="background" Background="{TemplateBinding Background}"
                          CacheMode="BitmapCache" />
                </controlsPrimitives:PanningBackgroundLayer>
                <controlsPrimitives:PanningTitleLayer x:Name="TitleLayer" CacheMode="BitmapCache"
                                                      ContentTemplate="{TemplateBinding TitleTemplate}" Content="{TemplateBinding Title}" FontSize="187"
                                                      FontFamily="{StaticResource PhoneFontFamilyLight}" HorizontalAlignment="Left" Margin="0,0,0,0" Grid.Row="0" />

                <controlsPrimitives:PanningLayer x:Name="ItemsLayer" HorizontalAlignment="Left"
                                                 Grid.Row="1">

                  <ItemsPresenter x:Name="items" />
                </controlsPrimitives:PanningLayer>


              </Grid>
            </ControlTemplate>
          </Setter.Value>
        </Setter>
      </Style>
      <DataTemplate x:Key="loadedItemsTemplate">
        <StackPanel Margin="0,-30,0,0">
          <Image Width="800" Height="340" Source="{Binding ImageSource}" Stretch="Uniform" />
          <StackPanel HorizontalAlignment="Center">
            <TextBlock TextWrapping="Wrap" Text="{Binding Name}" Foreground="#FF726A6A"
                       FontFamily="../Fonts/Albertsthal_Typewriter.ttf#Albertsthal Typewriter" FontSize="35" FontWeight="Bold"
                       d:LayoutOverrides="Width" />
            <TextBlock TextWrapping="Wrap" Text="{Binding Phoenetic}" Foreground="#FF726A6A"
                       FontFamily="Courier New" FontStyle="Italic" FontSize="18.667" FontWeight="Bold" d:LayoutOverrides="Width" />
          </StackPanel>
        </StackPanel>
      </DataTemplate>
 </phone:PhoneApplicationPage.Resources>
 
 <Grid x:Name="LayoutRoot">
 	
 	<controls:Panorama x:Name="MainPanorama" ItemsSource="{Binding Dinosaurs}" ItemTemplate="{StaticResource loadItemsTemplate}" Style="{PanoramaStyle1}"/>
 	
  </Grid>
 
 
{% endcodeblock %}

So with this template, I changed the style of the panorama to minimize the massive header section to make it look more like a card. For the panorama,
everything is loaded at runtime, so there are no LoadedItem or UnloadedItem events to subscribe to. This makes getting the currently selected item 
a little different than the Pivot control. The relevant event to handle for the Panorama is the SelectionChanged event. You can utilize it in your
code-behind, or preferably your [viewmodel](http://www.codeproject.com/Articles/160892/Binding-Events-to-Methods-in-the-Silverlight-MVVM). 

{% codeblock [ lang:csharp ] %}

public MainPage()
{
	//apply datacontext to the page to bind to my viewmodel.
	this.DataContext = App.ViewModel;
	
	//subscribe to the selection changed event
	MainPanorama.SelectionChanged += new EventHandler(ListSelectionChanged);
}

private void ListSelectionChanged(object sender, SelectionChangedEventArgs e)
{
	Card newItem;
	Card oldItem;

	//get the currently selected panorama item 
	if(e.AddedItems.Count > 0)
	{
		 currentItem = e.AddedItems[0] as Card;
	}
	
	//get previous item that was unselected 
	if(e.RemovedItems.Count > 0)
	{
		 oldItem = e.RemovedItems[0] as Card;
	}
	
	//do some on change some stuff. In my case, play some sounds.
	if(oldItem != null) oldItem.KillSounds();
	if(newItem != null) newItem.PlaySounds();
	
}

{% endcodeblock %}

So anyways that is pretty straightforward and is a much nicer experience for the user. I have seen many blog posts detailing the use of the Pivot control for
an items reel of sorts. IMHO, the panorama is nicer. See the difference in the video below...  


{% youtube TE_z7BUQrYQ %}


###Lazy loading 

So the downside to the panorama control is that it utilizes a non-virtualized panel for its ItemsControl.  What does this mean for us? It means that every Image in the view
is going to load and display on startup. That absolutely kills your memory. Microsoft recommends that you keep your peak memory usage below 90MB, I could easily surpass that with 
around 30 images loading in the panorama without lazy-loading. So to get acceptable performance I _had_ to implement some lazy-loading technique for the images in bound collection. 
To implement this, I started with my datamodel.

{% codeblock [ lang:csharp ] %}
	
	[DataContractAttribute]
    public class Card : INotifyPropertyChanged
	{
			//this is the relative path to the card image. 
			[DataMember]
			public string ImageUri {get;set;}
			
			[DataMember]
			public string Name {get;set;}
			
			[DataMember]
			public string Phoenetic {get;set;}
			
			//this is the ImageSource class that I will bind to in my view.
			private ImageSource _imgSource;
			[IgnoreDataMember]
			public ImageSource ImageSource
			{
				get{return _imgSource;}
				set
				{
					if(_imgSource == null || !_imgSource.Equals(value))
					{
						_imgSource = value;
						OnPropertyChanged("ImageSource");
					}
				}
			}
			
			public event PropertChangedEventHandler PropertyChanged;
			protected void OnPropertyChanged(string propertyName)
			{
				if(PropertyChanged != null)
					PropertyChanged(this, new PropertyChangedEventArgs(propertyName));
			}
			
	}

{% endcodeblock %}

So now I have this nice data model that holds both the ImageURI and an ImageSource property that I can bind to. Let's look at the data template for the Panorama one more time-

{% codeblock [ lang:xml ] %}

 <DataTemplate x:Key="loadedItemsTemplate">
        <StackPanel Margin="0,-30,0,0">
          <Image Width="800" Height="340" Source="{Binding ImageSource}" Stretch="Uniform" />
          <StackPanel HorizontalAlignment="Center">
            <TextBlock TextWrapping="Wrap" Text="{Binding Name}" Foreground="#FF726A6A"
                       FontFamily="../Fonts/Albertsthal_Typewriter.ttf#Albertsthal Typewriter" FontSize="35" FontWeight="Bold"
                       d:LayoutOverrides="Width" />
            <TextBlock TextWrapping="Wrap" Text="{Binding Phoenetic}" Foreground="#FF726A6A"
                       FontFamily="Courier New" FontStyle="Italic" FontSize="18.667" FontWeight="Bold" d:LayoutOverrides="Width" />
          </StackPanel>
        </StackPanel>
 </DataTemplate>
      
{% endcodeblock %}

Now here lets take a look at my Viewmodel. If you remember from earlier, the important event handler for the Panorama control for my use was the SelectionChanged event.
On the SelectionChanged event, I get the index of the currently selected item, and essentially start a background worker to assign the ImageSource
property from the ImageUri property for the next two images. At the same time, I null the references to ImageSource for the previous two images. This allows the GC to free up their memory on the 
next cycle.



{% codeblock [ lang:csharp ] %}

	 public void ListSelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            // get current selected card
            var currentItem = e.AddedItems[0] as Card;


            // add two more card in worker thread 
            LoadImageViewCardsAsync(currentItem);
        }

        /// <summary>
        /// Loads the next two card images in the deck and unloads the previous two
        /// </summary>
        public void LoadImageViewCardsAsync(Card currentCard)
        {
            var bgWorker = new BackgroundWorker();
            bgWorker.DoWork += BgWorkerDoWork;


            var index = Dinosaurs.IndexOf(currentCard);
            bgWorker.RunWorkerAsync(index);
        }
		
        private void BgWorkerDoWork(object sender, DoWorkEventArgs e)
        {
            var index = (int) e.Argument;

            for (var i = index; i < (index + 2); i++)
            {
                if (i > Dinosaurs.Count - 1) continue;
                var i1 = i;
                _dispatcher.BeginInvoke(delegate
                                            {
                                                var bmp =
                                                    new BitmapImage(new Uri(Dinosaurs[i1].ImageUri, UriKind.Relative));
                                                Dinosaurs[i1].ImageSource = bmp;
                                            });
            }

            //remove old images from UI by nulling the reference
            for (var i = index - 2; i >= (index - 3); i--)
            {
                if (i < 0) continue;
                var i1 = i;
                _dispatcher.BeginInvoke(delegate { Dinosaurs[i1].ImageSource = null; });
            }
        }

{% endcodeblock %}

So what was the result of this? For about 57 cards being loaded at a time, I was able to reduce my memory usage from 100MB to ~50MB while
viewing a flash card deck. If you run the Memory Analyzer you will see that it is the image loads on the UI that kill the memory, so this method
removes that barrier. To go even further, you could implement a buffer collection that is bound to the Panorama and dynamically load and unload full
items, however without the image my objects are very small so that was overkill for me. 


###Drawbacks
 
 The main drawback with using a panorama control is the initial load time for a page utilizing a panorama. Check out this telerik [post](http://blogs.telerik.com/blogs/posts/10-11-01/windows-phone-7-performance---emulator-vs-physical-device.aspx) about 
 the subject. This drawback was acceptable for me for the vastly better user experience vs. a pivot control. 
 
###FlipView to the rescue
 
 I wanted to add this in- Windows 8 fixes this problem and introduces a control called [FlipView](http://msdn.microsoft.com/en-us/library/windows/apps/hh850405.aspx). Awesome control that can be virtualized and databound with built-in touch and button navigation. 
 

 Next post I will talk about my Android implementation! 