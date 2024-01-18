export type Dictionary = {
  home: {
    title: string
    description: string
    start: string
    read_more: string
  }
  movies_list: {
    now_playing: string
    popular: string
    top_rated: string
    upcoming: string
    show_all: string
  }
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
  app_page: {
    dashboard_title: string
    dashboard_description: string
    popular_movies_title: string
    popular_tv_shows_title: string
  }
}
