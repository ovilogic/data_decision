from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

def run_kmeans(features_df, k=3):
    scaler = StandardScaler()
    scaled = scaler.fit_transform(features_df)

    model = KMeans(n_clusters=k, random_state=42, n_init=10)
    clusters = model.fit_predict(scaled)

    result = features_df.copy()
    result["cluster"] = clusters

    return result, model, scaler


