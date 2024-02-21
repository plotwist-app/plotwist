export type Dictionary = {
  home: Record<
    'title' | 'description' | 'primary_button' | 'secondary_button',
    string
  > & {
    statistics: {
      movies: Record<'value' | 'label', string>
      tv: Record<'value' | 'label', string>
      people: Record<'value' | 'label', string>
      users: Record<'label', string>
    }
  }
  movies_list: Record<
    'now_playing' | 'popular' | 'top_rated' | 'upcoming' | 'show_all',
    string
  >
  login_page: {
    title: string
    description: string
    no_account: string
    no_account_link: string
  }
  login_form: {
    email_label: string
    password_label: string
    show_password: string
    hide_password: string
    access_button: string

    email_required: string
    email_invalid: string
    password_required: string
    password_length: string

    login_success: string
    invalid_login_credentials: string
    try_again: string
  }
  sign_up_page: {
    title: string
    description: string
    already_have_account: string
    here_link: string
  }
  sign_up_form: {
    username_label: string
    email_label: string
    password_label: string
    show_password: string
    hide_password: string
    submit_button: string
    username_required: string
    email_required: string
    email_invalid: string
    password_required: string
    password_length: string
    sign_up_success: string
    invalid_sign_up_credentials: string
    try_again: string
  }
  app_page: {
    dashboard_title: string
    dashboard_description: string
    popular_movies_title: string
    popular_tv_shows_title: string
  }
  tabs: {
    reviews: string
    credits: string
    recommendations: string
    similar: string
    images: string
    videos: string

    seasons: string
  }
  navigation: {
    dashboard: string
    movies: string
    discover: string
    now_playing: string
    popular: string
    top_rated: string
    upcoming: string
    tv_shows: string
    airing_today: string
    on_the_air: string
    people: string
    lists: string
  }
  sidebar_search: {
    placeholder: string
    search_everything: string
    no_results: string
    movies: string
    tv_shows: string
    people: string
  }
  watch_providers: {
    label: string
    stream: string
    rent: string
    buy: string
  }
  lists_dropdown: {
    add_to_list: string
    my_lists: string
    removed_successfully: string
    added_successfully: string
    view_list: string
  }
  credits: {
    cast: string
    crew: string
  }
  review_form: {
    required: string
    rating_max: string
    success: string
    publish: string
    placeholder: string
  }
  review_item_actions: {
    like: string
    reply: string
    delete: string
    delete_success: string
  }
  movie_collection: {
    part_of: string
    see_collection: string
  }
  collection_list_dropdown: {
    add_collection_to_list: string
    my_lists: string
    collection_removed_successfully: string
    collection_added_successfully: string
    view_list: string
  }
  settings_dropdown: {
    theme: string
    light: string
    dark: string
    language: string
    account: string
    logout: string
  }
  auth: {
    logout_success: string
  }
  lists_page: {
    title: string
    description: string
  }
  list_card: {
    delete: string
    delete_success: string
  }
  create_new_list_form: {
    create_new_list: string
    name: string
    name_placeholder: string
    name_required: string
    description: string
    description_placeholder: string
    description_required: string
    submit: string
    list_created_success: string
  }
  list_page: {
    list_not_found: string
    see_your_lists_or_create_new: string
    here: string
  }
  list_items: {
    table: string
    grid: string
  }
  data_table: {
    title: string
    type: string
    overview: string
    added_at: string
    status: string
    no_results: string
    clear_filters: string
  }
  data_table_column_header: {
    asc: string
    desc: string
    hide: string
  }
  data_table_toolbar: {
    filter_items_placeholder: string
    reset: string
  }
  data_table_columns: {
    index: string
    title: string
    type: string
    added_at: string
    status: string
    actions: string
    movie: string
    tv_show: string
  }
  data_table_view_options: {
    view: string
    toggle_columns: string
  }
  statuses: {
    pending: string
    watching: string
    watched: string
  }
  list_item_actions: {
    use_as_cover: string
    status: string
    delete: string
    removed_successfully: string
    cover_changed_successfully: string
  }
  credits_columns: {
    year: string
    title: string
    role: string
    rating: string
  }
  movie_pages: {
    discover: {
      title: string
      description: string
    }
    now_playing: {
      title: string
      description: string
    }
    popular: {
      title: string
      description: string
    }
    top_rated: {
      title: string
      description: string
    }
    upcoming: {
      title: string
      description: string
    }
  }
  tv_show_pages: {
    airing_today: {
      title: string
      description: string
    }
    on_the_air: {
      title: string
      description: string
    }
    popular: {
      title: string
      description: string
    }
    top_rated: {
      title: string
      description: string
    }
    discover: {
      title: string
      description: string
    }
  }
  dashboard: {
    user_last_review: {
      title: string
      no_review_message: string
      no_review_action: string
    }
    popular_reviews: {
      title: string
    }
  }
  movies_list_filters: {
    title: string
    tabs: {
      filters: string
      order: string
      watch_providers: string
    }
    actions: {
      close: string
      save_changes: string
    }
    genres_field: {
      label: string
      placeholder: string
      no_genre_message: string
    }
    language_field: {
      label: string
      placeholder: string
    }
    release_date_field: {
      from_label: string
      to_label: string
      from_placeholder: string
      to_placeholder: string
      select_date: string
    }
    sort_by: {
      label: string
      placeholder: string
      options: {
        'popularity.desc': string
        'popularity.asc': string
        'revenue.desc': string
        'revenue.asc': string
        'primary_release_date.desc': string
        'primary_release_date.asc': string
        'vote_average.desc': string
        'vote_average.asc': string
        'vote_count.desc': string
        'vote_count.asc': string
      }
    }
    watch_providers_field: {
      label: string
      placeholder: string
      clear_filters: string
      no_results: string
    }
    watch_region_field: {
      label: string
      placeholder: string
    }
    vote_average_field: {
      label: string
    }
    vote_count_field: {
      label: string
    }
    no_results: string
  }
  tv_shows_list_filters: {
    title: string
    tabs: {
      filters: string
      order: string
      watch_providers: string
    }
    actions: {
      close: string
      save_changes: string
    }
    genres_field: {
      label: string
      placeholder: string
      no_genre_message: string
    }
    language_field: {
      label: string
      placeholder: string
    }
    air_date: {
      from_label: string
      to_label: string
      from_placeholder: string
      to_placeholder: string
      select_date: string
    }
    sort_by: {
      label: string
      placeholder: string
      options: {
        'popularity.desc': string
        'popularity.asc': string
        'air_date.desc': string
        'air_date.asc': string
        'vote_average.desc': string
        'vote_average.asc': string
        'vote_count.desc': string
        'vote_count.asc': string
      }
    }
    watch_providers_field: {
      label: string
      placeholder: string
      clear_filters: string
      no_results: string
    }
    watch_region_field: {
      label: string
      placeholder: string
    }
    vote_average_field: {
      label: string
    }
    vote_count_field: {
      label: string
    }
    no_results: string
  }
}
