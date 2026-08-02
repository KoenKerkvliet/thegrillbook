alter table public.recipes
  add column grill_temperature_c integer,
  add column target_temperature_c integer;

alter table public.recipes
  add constraint recipes_grill_temperature_c_range
    check (grill_temperature_c is null or grill_temperature_c between 40 and 400),
  add constraint recipes_target_temperature_c_range
    check (target_temperature_c is null or target_temperature_c between 1 and 150);

comment on column public.recipes.grill_temperature_c is
  'Target temperature of the barbecue or smoker in degrees Celsius.';

comment on column public.recipes.target_temperature_c is
  'Desired core temperature in degrees Celsius.';
