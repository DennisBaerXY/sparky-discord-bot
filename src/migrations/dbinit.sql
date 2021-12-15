--postgresql database

--Drop tables


create TABLE IF NOT EXISTS polls (
  polls_id serial PRIMARY KEY,
  guilde_id bigint NOT NULL,
  title TEXT not null,
  description TEXT,
  created_by text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp
);
create TABLE IF NOT EXISTS options (
  options_id serial  primary key,
  polls_id int references polls(polls_id),
  name varchar(255) not null,
  value int DEFAULT 0
);






