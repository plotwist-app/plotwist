export type Dictionary = {
  home: Record<'title' | 'description' | 'keywords', string> & {
    statistics: {
      movies: {
        value: number
        label: string
      }
      tv: {
        value: number
        label: string
      }
      people: {
        value: number
        label: string
      }
      episodes: {
        value: number
        label: string
      }
      users: Record<'label', string>
    }
    features: {
      section_title: string
      section_description: string
      lists: {
        title: string
        description: string
      }
      reviews: {
        title: string
        description: string
      }
      multi_lang_support: {
        title: string
        description: string
      }
      communities: {
        title: string
        description: string
      }
    }
  }
  home_prices: {
    title: string
    description: string
    monthly: string
    yearly: string
    free_plan: {
      title: string
      price: string
      description: string
      benefits: string[]
      start_now: string
    }
    pro_plan: {
      title: string
      price: string
      recommended: string
      description: string
      benefits: string[]
      subscribe: string
    }
    patreon_plan: {
      title: string
      price: string
      description: string
      coming_soon: string
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
    username_invalid: string
    email_required: string
    email_invalid: string
    password_required: string
    password_length: string
    sign_up_success: string
    invalid_sign_up_credentials: string
    try_again: string
    username_already_taken: string
  }
  app_page: {
    dashboard_title: string
    dashboard_description: string
    popular_movies_title: string
    popular_tv_series_title: string
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
    home: string
    movies: string
    discover: string
    discover_description: string
    now_playing: string
    now_playing_description: string
    popular: string
    popular_description: string
    top_rated: string
    top_rated_description: string
    upcoming: string
    upcoming_description: string
    tv_series: string
    tv_series_description: string
    airing_today: string
    airing_today_description: string
    on_the_air: string
    on_the_air_description: string
    people: string
    lists: string
    lists_description: string
  }
  sidebar_search: {
    placeholder: string
    search_everything: string
    no_results: string
    movies: string
    tv_series: string
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
    login: string
    register: string
    or: string
    make_first_review: string
  }
  review_reply_form: {
    success: string
  }
  review_reply: {
    reply: string
    placeholder: string
    open_replies: string
    hide_replies: string
  }
  review_item: {
    ago: string
  }
  review_item_actions: {
    like: string
    reply: string
    dialog_title: string
    dialog_description: string
  }
  review_reply_actions: {
    like: string
    delete: string
    delete_success: string
    dialog_title: string
    dialog_description: string
    dialog_close: string
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
    profile: string
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
    dialog_title: string
    dialog_description: string
    dialog_close: string
  }
  list_form: {
    create_new_list: string
    name: string
    name_placeholder: string
    name_required: string
    description: string
    description_placeholder: string
    visibility: string
    visibility_option_public: string
    visibility_option_network: string
    visibility_option_private: string
    visibility_option_description_public: string
    visibility_option_description_network: string
    visibility_option_description_private: string
    submit: string
    list_created_success: string

    edit_list: string
    list_edited_success: string
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
    tv_serie: string
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
    see_details: string
  }
  credits_columns: {
    year: string
    title: string
    role: string
    rating: string
  }
  animes_page: {
    title: string
    description: string
    button_tv_series: string
    button_movies: string
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
  tv_serie_pages: {
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
  user_last_review: {
    title: string
    no_review_message: string
    no_review_action: string
    login: string
    register: string
    or: string
    make_first_review: string
  }
  popular_reviews: {
    title: string
    no_reviews_found: string
    explore_popular_movies: string
    last_week: string
    last_month: string
    all_time: string
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
  tv_series_list_filters: {
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
  list_command: {
    search_placeholder: string
    no_results: string
    tv_series_label: string
    tv_added_success: string
    tv_removed_success: string
    movies_label: string
    remove_from_list: string
    add_to_list: string
    view_details: string
    movie_added_success: string
    movie_removed_success: string
  }
  no_account_tooltip: string
  user_resume: {
    by: string
  }
  tv_serie_season_details: {
    episode_number: string
    name: string
    overview: string
    runtime: string
    vote: string
  }
  popular_people: {
    title: string
    description: string
  }
  changelog: {
    title: string
    description: string
    subscribe: string
  }
  footer: {
    status: string
    rights: string
    data_provided_by: string
    sections: {
      product: string
      company: string
      developers: string
      features: string
      pricing: string
      changelog: string
      download: string
      about_us: string
      careers: string
      brand: string
      status: string
      github: string
    }
  }
  text_actions: {
    expand: string
    contract: string
  }
  grid: string
  table: string
  person_page: {
    credit_list: {
      show_all: string
      show_less: string
    }
  }
  thank_you: {
    title: string
    subtitle: string
    description: string
    feature1: {
      title: string
      description: string
    }
    feature2: {
      title: string
      description: string
    }
    feature3: {
      title: string
      description: string
    }
    feature4: {
      title: string
      description: string
    }
  }
  list_recommendations: {
    title: string
    movies: string
    series: string
    block: {
      first_line: string
      second_line: string
    }
    added_successfully: string
    add_to_list: string
    view_details: string
  }
  profile: {
    achievements: string
    reviews: string
    lists: string
    communities: string
    work_in_progress: string
  }
  profile_form: {
    dialog_title: string
    username_label: string
    username_placeholder: string
    username_required: string
    username_invalid: string
    error_existent_username: string
    same_username: string
    submit_button: string
  }
  profile_banner: {
    change_banner: string
    changed_successfully: string
  }
  private_list: {
    title: string
    description: string
    cta: string
  }
  review_likes: {
    title: string
    view_profile: string
  }
  access_now: string
  create_account: string
  search_movies_or_series: string
  select_an_image: string
  profile_image_changed_successfully: string
  review_deleted_successfully: string
  edit: string
  delete: string
  close: string
  edit_review: string
  edit_reply: string
}
