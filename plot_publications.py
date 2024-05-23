import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

fig, ax = plt.subplots()
df = pd.read_csv('publication_history_df.csv')

values=['ACTI','ACL','COM',"ACLN"]
df = df.query('type in @values')
df["type"] = df.type.map({"ACTI":"Conférences internationales","ACL":"Journaux internationaux","COM":"Communications","ACLN":"Journaux nationaux"})

df = df.rename(columns={"type": "Type de publication", "nb":"Nombre de publications", "year":"Date de publication"})

print(df.to_string())

plot = sns.relplot(
    data=df, kind="line",
    x="Date de publication", y="Nombre de publications", hue="Type de publication",
)
plot.savefig('publication_history.svg', format='svg')

fig, ax = plt.subplots()

journal_df = pd.read_csv('journals.csv')
journal_df = journal_df.query('name != "undefined"')
journal_df = journal_df.sort_values(by=['nb'], ascending=False)
journal_df = journal_df.loc[journal_df.index[0:20]]

print(journal_df.to_string())

journal_df["color"] = journal_df.type.map({"national journal":"tab:orange","journal":'tab:blue', "proceedings":'tab:red'})
journal_df["name"] = journal_df.name.map({
    "Revue Française de Photogrammétrie et de Télédétection":'RFPT',
    "ISPRS International Journal of Geo-Information":'IJGI',
    "Remote Sensing":"RS",
    "International Journal of Cartography":"IJC",
    "ISPRS Annals of the Photogrammetry, Remote Sensing and Spatial Information Sciences":"IAPRSSIS",
    "ISPRS Journal of Photogrammetry and Remote Sensing":"IJPRS",
    "International Journal of Geographical Information Science":"IJGIS",
    "Photogrammetric engineering and remote sensing":"PERS",
    "Remote Sensing of Environment":"RSE",
    "IEEE Journal of Selected Topics in Applied Earth Observations and Remote Sensing":"JSTAEORS",
    "ISPRS Annals of Photogrammetry, Remote Sensing and Spatial Information Sciences":"IAPRSSIS",
    "Cartography and Geographic Information Science":"CGIS",
    "Pattern Recognition":"PR",
    "The Cartographic Journal":"TCJ",
    "IEEE Transactions on Geoscience and Remote Sensing":"TGRS",
    "Proceedings of the ICA":"PICA",
    "Revue Internationale de Géomatique":"RIG",
    "Computers, Environment and Urban Systems":"CEUS",
    "Journal of Spatial Information Science":"JoSIS",
    "Environmental Monitoring and Assessment":"EMA",
    "Earth System Science Data":"ESSA",
    "Revue XYZ":"XYZ",
    "Cybergeo : Revue européenne de géographie / European journal of geography":"Cybergeo",
    "AGILE: GIScience Series":"AGILE",
    "Tectonics":"Tectonics",
    "Revue française des sciences de l'information et de la communication":"RFSIC",
    "Atmospheric Chemistry and Physics":"ACP",
    "Kinetic and Related Models":"KRM",
    "Physical Review Letters":"PRL",
    "Sensors":"Sensors",
    })

ax.bar(journal_df.name, journal_df.nb, label=journal_df.name, color=journal_df.color,width=0.9)
ax.set_ylabel('Nombre de publications')
# ax.set_title('Journals and conference proceedings')
plt.xticks(rotation=90)
plt.tick_params(bottom = False)
ax.spines[['right', 'top']].set_visible(False)
# Creating legend with color box
journal_box = mpatches.Patch(color='tab:blue', label='Journaux internationaux', linewidth=12)
national_journal_box = mpatches.Patch(color='tab:orange', label='Journaux nationaux', linewidth=12)
proceedings_box = mpatches.Patch(color='tab:red', label='Actes de conférence', linewidth=12)
plt.legend(handles=[journal_box,national_journal_box,proceedings_box], loc='upper right', frameon=False)
plt.savefig('journals_conferences.svg', format='svg')
