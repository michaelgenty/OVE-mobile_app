// The Application

// Our overall **MissionPageView** is the top-level piece of UI.
app.Views.MissionPageView = app.Extensions.View.extend({

	/* Instead of generating a new element, bind to the existing skeleton of
	 the App already present in the HTML.*/
	id: 'mission-page',

	statsTemplate: _.template($('#mission-nav-list').html()),

	menuTemplate: _.template($('#menu-template').html()),

	// Delegated events for creating new items, and clearing completed ones.
	events: {
		'keypress #new-mission': 'createOnEnter',
		'click .left-menu': 'toggleMenu'
	},

	// At initialization we bind to the relevant events on the `Missions`
	// collection, when items are added or changed. Kick things off by
	// loading any preexisting missions that might be saved in *localStorage*.
	initialize: function () {
		this.animateIn = 'iosSlideInRight';
		this.animateOut = 'slideOutRight';

		this.template = _.template($('script[name=mission-page]').html());

		this.$el.html(this.template());

		this.$page = this.$('.page');

		this.$leftMenu = this.$('.left-menu');
		
		this.$input = this.$('#new-mission');
		this.$navigation = this.$('.navigation');
		this.$main = this.$('#main');
		this.$list = this.$('#mission-list');
		this.$pageBody = this.$('.page-body');

		app.missions = new Missions();
		app.MissionFilter = 'actuality';

		//call for each line in database
		this.listenTo(app.missions, 'add', this.addOne);
		//listen on the sync and not the reset
		//->permit to keep the datas when we quit and re-launch the page
		this.listenTo(app.missions, 'sync', this.addAll);
		this.listenTo(app.missions, 'change:completed', this.filterOne);
		this.listenTo(app.missions, 'filter', this.filterAll);
		this.listenTo(app.missions, 'all', _.debounce(this.render, 0));

		// Suppresses 'add' events with {reset: true} and prevents the app view
		// from being re-rendered for every model. Only renders when the 'reset'
		// event is triggered at the end of the fetch.
		app.missions.fetch({});


		return this;
	},

	// Re-rendering the App just means refreshing the statistics -- the rest
	// of the app doesn't change.
	onRender: function () {

		var completed =app.missions.completed().length;
		var remaining =app.missions.remaining().length;

		if (app.missions.length) {
			this.$main.show();
			this.$navigation.show();

			this.$navigation.html(this.statsTemplate({
				completed: completed,
				remaining: remaining
			}));

			this.$pageBody.append(this.menuTemplate());

			this.$('.filters li a')
				.removeClass('selected')
				.filter('[href="#/filterMissions/' + (app.MissionFilter || '') + '"]')
				.addClass('selected');
		} else {
			this.$main.hide();
		}


		return this;
	},

	// Add a single mission itemMap to the list by creating a view for it, and
	// appending its element to the `<ul>`.
	addOne: function (mission) {
		var view = new app.Views.MissionView({ model: mission });
		this.$list.append(view.render().el);
	},

	// Add all items in the **Missions** collection at once.
	addAll: function () {
		this.$list.html('');
		app.missions.each(this.addOne, this);
	},

	filterOne: function (mission) {
		mission.trigger('visible');
	},

	filterAll: function () {
		app.missions.each(this.filterOne, this);
	},

	// Generate the attributes for a new Mission itemMap.
	newAttributes: function () {
		return {
			title: this.$input.val().trim(),
			order: app.missions.nextOrder(),
			completed: false
		};
	},

	// If you hit return in the main input field, create new **Mission** model,
	// persisting it to *localStorage*.
	createOnEnter: function (e) {
		if (e.which === ENTER_KEY && this.$input.val().trim()) {
			app.missions.create(this.newAttributes());
			this.$input.val('');
		}
	},

	//display or not the panel menu
	toggleMenu: function (e) {
		this.$page.toggleClass('sml-open');
		this.$leftMenu.toggleClass('open');
	}

	
});