alter table public.recipe_steps
  add column section text;

comment on column public.recipe_steps.section is
  'Optional heading shown before this step, for example Voorbereiden or Serveren.';
