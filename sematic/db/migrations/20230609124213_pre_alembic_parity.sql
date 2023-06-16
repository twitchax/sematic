-- migrate:up

UPDATE runs SET function_path = '' WHERE function_path IS NULL;

ALTER TABLE artifacts ALTER COLUMN type_serialization SET NOT NULL;
ALTER TABLE edges ALTER COLUMN artifact_id SET NOT NULL;
ALTER TABLE jobs ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE jobs ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE notes ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE notes ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE runs ALTER COLUMN function_path SET NOT NULL;
ALTER TABLE runs ALTER COLUMN root_id SET NOT NULL;
ALTER TABLE runs ALTER COLUMN tags SET NOT NULL;
ALTER TABLE runs ALTER COLUMN source_code SET NOT NULL;

ALTER TABLE edges ADD CONSTRAINT edges_destination_run_id_fkey FOREIGN KEY (destination_run_id) REFERENCES runs(id);
ALTER TABLE edges ADD CONSTRAINT edges_source_run_id_fkey FOREIGN KEY (source_run_id) REFERENCES runs(id);

ALTER TABLE metric_values ADD CONSTRAINT metric_values_metric_id_fkey FOREIGN KEY (metric_id) REFERENCES metric_labels(metric_id);
ALTER TABLE runs ADD CONSTRAINT runs_root_id_fkey FOREIGN KEY (root_id) REFERENCES runs(id);

ALTER INDEX jobs_run_id RENAME TO ix_jobs_run_id;
ALTER INDEX runs_cache_key_index RENAME TO ix_runs_cache_key;
ALTER INDEX runs_calculator_path RENAME TO ix_runs_function_path;

-- migrate:down

ALTER TABLE artifacts ALTER COLUMN type_serialization DROP NOT NULL;
ALTER TABLE edges ALTER COLUMN artifact_id DROP NOT NULL;
ALTER TABLE jobs ALTER COLUMN created_at DROP NOT NULL;
ALTER TABLE jobs ALTER COLUMN updated_at DROP NOT NULL;
ALTER TABLE notes ALTER COLUMN created_at DROP NOT NULL;
ALTER TABLE notes ALTER COLUMN updated_at DROP NOT NULL;
ALTER TABLE runs ALTER COLUMN function_path DROP NOT NULL;
ALTER TABLE runs ALTER COLUMN root_id DROP NOT NULL;
ALTER TABLE runs ALTER COLUMN tags DROP NOT NULL;
ALTER TABLE runs ALTER COLUMN source_code DROP NOT NULL;

ALTER TABLE edges DROP CONSTRAINT edges_destination_run_id_fkey;
ALTER TABLE edges DROP CONSTRAINT edges_source_run_id_fkey;

ALTER TABLE metric_values DROP CONSTRAINT metric_values_metric_id_fkey;
ALTER TABLE runs DROP CONSTRAINT runs_root_id_fkey;

ALTER INDEX ix_jobs_run_id RENAME TO jobs_run_id;
ALTER INDEX ix_runs_cache_key RENAME TO runs_cache_key_index;
ALTER INDEX ix_runs_function_path RENAME TO runs_calculator_path;
