winkstart.module('core', 'linknav', {
        css: [
            'css/linknav.css'
        ],

        templates: {
            link: 'tmpl/link.html',
            sublink: 'tmpl/sublink.html',
            sublink_divider: 'tmpl/sublink_divider.html',
            category: 'tmpl/category.html',
            link_divider: 'tmpl/link_divider.html'
        },

        subscribe: {
            'linknav.add': 'add',
            'linknav.sub_add': 'sub_add',
            'linknav.edit': 'edit'
        },

        targets: {
            link_nav: '#ws-topbar .links'
        }
    },

    function() {
        /*winkstart.publish('linknav.add', {
            name: 'help',
            weight: 50,
            content: 'Help',
            new_page: true,
            href: (winkstart.config.nav || {}).help
        });*/
    },

    {
        add: function(args) {
            var THIS = this,
                normalized_args = {
                    name: args.name || '',
                    weight: args.weight || null,
                    content: args.content || '???',
                    new_page: args.new_page || false,
                    href: args.href || '#',
                    publish: args.publish || 'dev.null',
                    modifier: args.modifier || null
                },
                links_html = $(THIS.config.targets.link_nav),
                link_list_html = $('.link', links_html),
                link_html = THIS.templates.link.tmpl(normalized_args),
                link_divider_html = THIS.templates.link_divider.tmpl();
                inserted = false;

            $('> a', link_html)
                .append(normalized_args.content);

            (link_html)
                .hoverIntent({
                    sensitivity: 1,
                    interval: 40,
                    timeout: 200,
                    over: function() {
                        if((link_html).dataset('dropdown')) {
                            (link_html).addClass('open');
                        }
                    },
                    out: function() {
                        if((link_html).dataset('dropdown')) {
                            (link_html).removeClass('open');
                        }
                    }
                });

            if(normalized_args.modifier) {
                if(typeof normalized_args.modifier == 'function') {
                    //No, this is not a typo. Let the dev chose if they want 'this' or a param 
                    normalized_args.modifier.call(link_html, link_html);
                }
            }

            (link_list_html).each(function(index) {
                var weight = $(this).dataset('weight');

                if(normalized_args.weight < weight) {
                    $(this).before(link_html);

                    inserted = true;

                    return false;
                }
                else if(index >= link_list_html.length - 1) {
                    $(this).after(link_html);

                    inserted = true;

                    return false;
                }
            });

            if(!inserted) {
                (links_html)
                    .append(link_divider_html)
                    .append(link_html);

            }
        },

        sub_add: function(data) {
            var THIS = this,
                link_list_html = $(THIS.config.targets.link_nav),
                link_html = $('.link[data-link="' + data.link + '"]', link_list_html),
                link_dropdown_html = $('> .dropdown-menu', link_html),
                link_sublink_list_html = $('.sublink[data-category="' + (data.category || '') + '"]', link_dropdown_html),
                link_sublink_html = THIS.templates.sublink.tmpl(data),
                inserted = false,
                module_divider_html,
                category_html;

                THIS.ensure_dropdown(link_html);

            $('> a', link_sublink_html).click(function(ev) {
                ev.preventDefault();
                winkstart.publish(data.publish || data.link + '.' + data.sublink + '.activate');
            });

            (link_sublink_list_html).each(function(index) {
                var weight = $(this).dataset('weight');

                if(data.weight < weight) {
                    $(this).before(link_sublink_html);

                    inserted = true;

                    return false;
                }
                else if(index >= link_sublink_list_html.length - 1) {
                    $(this).after(link_sublink_html);

                    inserted = true;

                    return false;
                }
            });

            if(!inserted) {
                if(data.category) {
                    /* This should become its own function at somepoint... */
                    sublink_divider_html = THIS.templates.sublink_divider.tmpl();
                    category_html = THIS.templates.sublink.tmpl({
                        name: data.category,
                        label: data.category[0].toUpperCase() + data.category.slice(1)
                    });

                    (category_html)
                        .hoverIntent({
                            sensitivity: 1,
                            interval: 40,
                            timeout: 200,
                            over: function() {
                                if((category_html).dataset('dropdown')) {
                                    (category_html).addClass('open');
                                }
                            },
                            out: function() {
                                if((category_html).dataset('dropdown')) {
                                    (category_html).removeClass('open');
                                }
                            }
                        });

                    $('.dropdown-menu', category_html).prepend(link_module_html);

                    (link_dropdown_html)
                        .append(sublink_divider_html)
                        .append(category_html);
                }
                else {
                    (link_dropdown_html).prepend(link_sublink_html);
                }
            }

            /* Make sure all the sub menus are aligned correctly */
            $('.category > .dropdown-menu', link_dropdown_html).css('left', -(link_dropdown_html).width());

            if(data.modifier) {
                if(typeof data.modifier == 'function') {
                    //No, this is not a typo. Let the dev chose if they want 'this' or a param 
                    data.modifier.call(link_sublink_html, link_sublink_html);
                }
            }
        },

        ensure_dropdown: function(link_html) {
            $('> a', link_html).addClass('dropdown-toggle');

            (link_html)
                .addClass('dropdown')
                .dataset('dropdown', 'dropdown');
        }
        /*
        edit: function(args, target) {
            var THIS = this,
                link_html = target;

            if(!link_html) {
                link_html = $('.link[data-link="' + args.name + '"]', THIS.config.targets.link_nav);
            }

            if(args.content) {
                $('> a', link_html)
                    .empty()
                    .append(args.content);
            }

            if(args.href) {
                $('> a', link_html)
                    .attr('href', args.href);
            }

            if(args.new_page) {
                $('> a', link_html)
                    .attr('target', '_blank');
            }

            if(args.publish) {
                $('> a', link_html)
                    .unbind('click.linknav')
                    .bind('click.linknav', function(ev) {
                        var href = $(this).attr('href');

                        if(!href || href == '#') {
                            ev.preventDefault();

                            winkstart.publish(args.publish, {});
                        }
                    });
            }           
        }*/

        /* This is modeled much like whappnav, there should be no problem implementing dropdowns */
    }
);