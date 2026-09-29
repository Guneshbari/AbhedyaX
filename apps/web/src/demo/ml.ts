/**
 * Canonical Machine Learning Status Fixtures for AbhedyaX Demo Provider.
 * Encrypted traffic classifier model metrics and attribution weights.
 */

import { MLModelStatusResponse } from "@/lib/api/analyses";

export const DEMO_ML_MODEL_STATUS: MLModelStatusResponse = {
  status: "active",
  model_name: "RandomForestClassifier",
  model_version: "v1.2.0-sihtuned",
  algorithm: "Random Forest (Ensemble of 150 Estimators)",
  dataset_version: "SIH-2026-VPN-TRAFFIC-v2",
  feature_count: 28,
  classes: ["Video", "VoIP", "Web", "Messaging", "SSH", "Unknown"],
  abstention_threshold: 0.55,
  metrics: {
    validation_macro_f1: 0.942,
    test_accuracy: 0.945,
    test_balanced_accuracy: 0.938,
    test_macro_f1: 0.941,
    test_weighted_f1: 0.944,
    confusion_matrix: [
      [94, 2, 3, 1, 0],
      [1, 96, 2, 1, 0],
      [2, 2, 92, 3, 1],
      [1, 1, 3, 95, 0],
      [0, 0, 1, 1, 98],
    ],
    per_class_metrics: {
      Video: { precision: 0.959, recall: 0.940, f1_score: 0.949, support: 100 },
      VoIP: { precision: 0.950, recall: 0.960, f1_score: 0.955, support: 100 },
      Web: { precision: 0.911, recall: 0.920, f1_score: 0.915, support: 100 },
      Messaging: { precision: 0.941, recall: 0.950, f1_score: 0.945, support: 100 },
      SSH: { precision: 0.990, recall: 0.980, f1_score: 0.985, support: 100 },
    },
    feature_importance: {
      mean_packet_size: 0.245,
      median_packet_size: 0.182,
      mean_inter_arrival_time: 0.154,
      direction_ratio: 0.118,
      packet_size_p90: 0.089,
      burst_rate: 0.076,
      burst_count: 0.052,
      packet_rate: 0.041,
      flow_duration: 0.028,
      packet_size_p10: 0.015,
    },
    candidate_comparisons: {
      "Random Forest (Selected)": { accuracy: 0.945, macro_f1: 0.942 },
      "XGBoost Classifier": { accuracy: 0.938, macro_f1: 0.935 },
      "Support Vector Classifier (RBF)": { accuracy: 0.902, macro_f1: 0.898 },
      "Logistic Regression Baseline": { accuracy: 0.824, macro_f1: 0.812 },
    },
  },
  created_at: "2026-09-28T08:00:00Z",
  feature_names: [
    "mean_packet_size",
    "median_packet_size",
    "std_packet_size",
    "packet_size_p10",
    "packet_size_p90",
    "flow_duration",
    "mean_inter_arrival_time",
    "std_inter_arrival_time",
    "packet_rate",
    "byte_rate",
    "direction_ratio",
    "burst_count",
    "burst_rate",
    "mean_burst_size",
  ],
  message: "Random Forest traffic inference model loaded and ready for zero-payload wire classification.",
};
